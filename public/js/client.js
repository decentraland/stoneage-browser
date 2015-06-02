'use strict';

var util = require('util');
var events = require('events');

var core = require('decentraland-core');
var BN = core.crypto.BN;
var Block = core.Block;
var BlockHeader = core.BlockHeader;
var Blockchain = core.Blockchain;
var Miner = require('./mining');
var Networking = require('./networking');
var config = require('./config.js');
var Pos = require('./components/position');
var _ = core.deps._;
var $ = core.util.preconditions;

var LocalStorageTxStore = require('./store/transaction');
var LocalStorageBlockStore = require('./store/block');

var RETARGET_PERIOD = 50;
var DESIRED_BLOCK_TIME = 1 / 10 * 60; // 2 minutes
var DESIRED_RETARGET_TIME = DESIRED_BLOCK_TIME * RETARGET_PERIOD;
var MAX_TIME_DELTA = 1 * (60 * 60); // 1 hour
var MAX_BLOCKS_IN_INV = 50;

function Client() {
  events.EventEmitter.call(this);
  var self = this;

  this.blockchain = new Blockchain();
  this.blockchain.blockStore = LocalStorageBlockStore;
  this.blockchain.txStore = LocalStorageTxStore;
  this.loadBlockchain();

  var wallet = localStorage.getItem('privateKeys');
  this.wallet = {};
  if (!wallet) {
    var privateKey = new core.PrivateKey();
    this.wallet[privateKey.publicKey.toString()] = privateKey;
    this.keys = [privateKey.publicKey];
    localStorage.setItem('privateKeys', JSON.stringify(
      _.values(self.wallet).map(function(privateKey) {
        return privateKey.toString();
      })
    ));
  } else {
    this.keys = [];
    var privateKeys = JSON.parse(wallet);
    privateKeys.forEach(function(privateKey) {
      privateKey = new core.PrivateKey(privateKey);
      self.wallet[privateKey.publicKey.toString()] = privateKey;
      self.keys.push(privateKey.publicKey.toString());
    });
  }

  //allows setting peer id from url
  config.networking.id = window.location.hash.substring(1) || config.networking.id;
  this._setupNetworking();

  this.txPool = [];
  this.focusPixel = null;

  this.miner = new Miner({
    client: this,
    publicKey: this.keys[0],
    target: {
      x: 0,
      y: 0
    },
    color: 0xff0000,
    txPool: this.txPool,
    callback: this.receiveBlock.bind(this),
    enableMining: false,
    bits: this.bits,
  });
  this.retarget();
  this.miner.on('block', this.receiveBlock.bind(this));

  this.miner.startMining();

  this.inventory = {};
}
util.inherits(Client, events.EventEmitter);

Client.prototype.loadBlockchain = function() {
  var self = this;
  var tip = localStorage.getItem('tip');

  if (!tip) {
    this.blockchain.proposeNewBlock(core.Block.genesis);
    return;
  }

  var blocks = [];
  var block;
  while (block = this.blockchain.getBlock(tip)) {
    blocks.push(block);
    tip = block.prevHash;
  }
  blocks.reverse();
  blocks.map(function(block) {
    this.blockchain.proposeNewBlock(block);
    console.log(block.id, block.height, block.timestamp, block.bits.toString(16));
    self.bits = block.bits;
  }, this);
};

Client.prototype._setupNetworking = function() {

  var networking = new Networking(config.networking);
  var self = this;
  var after = {};

  networking.on('connection', function(peerID) {
    console.log('new connection', peerID);
    networking.send(peerID, 'height', self.blockchain.getCurrentHeight());
    networking.send(peerID, 'getpeers', {});
  });

  networking.on('getpeers', function(peerID) {
    networking.send(peerID, 'peers', _.keys(networking.peers));
  });

  networking.on('peers', function(peerID, peers) {
    peers.forEach(function(peer) {
      networking.openConnection(peer);
    });
  });

  networking.on('height', function(peerID, height) {
    console.log(peerID, 'height', height);
    if (height > self.blockchain.getCurrentHeight()) {
      networking.send(peerID, 'getblocks', self.blockchain.getBlockLocator());
    }
  });

  networking.on('inv', function(peerID, inv) {
    //console.log('inv from peer', peerID, inv);
    var unknown = [];
    inv.forEach(function(hash) {
      var block = self.blockchain.getBlock(hash);
      if (block) {
        return;
      }
      self.inventory[hash] = true;
      unknown.push(hash);
    });
    if (unknown.length !== 0) {
      networking.send(peerID, 'getdata', unknown);
    }
  });

  networking.on('getdata', function(peerID, inv) {
    //console.log('getdata from peer', peerID, inv);
    inv.forEach(function(blockhash) {
      var block = self.blockchain.getBlock(blockhash);
      if (block) {
        networking.send(peerID, 'block', block.toString());
      }
    });
  });

  networking.on('getblocks', function(peerID, locator) {
    //console.log('getblocks from peer', peerID, locator);
    var i = 0;
    var first = Block.genesis.hash;
    while (i < locator.length) {
      if (!_.isUndefined(self.blockchain.height[locator[i]])) {
        first = locator[i];
        break;
      }
      i++;
    }
    first = self.blockchain.next[first];
    var blocks = [first];
    var current = first;
    while (blocks.length < MAX_BLOCKS_IN_INV && self.blockchain.next[current]) {
      current = self.blockchain.next[current];
      blocks.push(current);
    }
    networking.send(peerID, 'inv', blocks);
  });

  networking.on('block', function(peerID, block) {

    var unserialized = Block.fromBuffer(block);
    var hash = unserialized.hash;

    //console.log('block from peer', peerID, hash);
    delete self.inventory[hash];

    if (!self.blockchain.getBlock(unserialized.prevHash)) {
      // No previous hash; ask it and queue block to process later
      after[unserialized.prevHash] = unserialized;
      console.log('prevhash', unserialized.prevHash);
      console.log('No previous hash; ask it and queue block to process later');
    } else {
      self.receiveBlock(unserialized, peerID);

      // Process queued blocks
      while (after[hash]) {
        unserialized = after[unserialized.hash];
        self.receiveBlock(unserialized, peerID);
        delete after[hash];
        hash = unserialized.hash;
      }
    }
    if (_.keys(self.inventory).length === 0) {
      var locator = self.blockchain.getBlockLocator();
      console.log('requesting blocks with locator of size', locator.length);
      networking.send(peerID, 'getblocks', locator);
    }

  });

  networking.start();
  this.networking = networking;
};

Client.prototype.receiveBlock = function(block, peerID) {
  var result;
  var self = this;

  var hasPrev = this.blockchain.hasData(block.prevHash);
  if (!hasPrev) {
    console.log('dont have data on prevhash for received block');
    this.networking.send(peerID, 'getblocks', this.blockchain.getBlockLocator());
    return;
  }

  var now = new Date().getTime() / 1000;
  var delta = Math.abs(block.timestamp - now);
  if (delta > MAX_TIME_DELTA) {
    console.log('rejected block due to timestamp delta', delta);
    return;
  }

  try {
    result = this.blockchain.proposeNewBlock(block);
  } catch (e) {
    console.log('Invalid block', block.id, 'from peer', peerID, e);
    //this.networking.closeConnection(peerID);
    return;
  }
  localStorage.setItem('tip', this.blockchain.tip);
  console.log('new tip', block.id, block.height);

  if (block.height > 1 && (block.height - 1) % RETARGET_PERIOD === 0) {
    this.recomputeDifficulty();
  }

  if (result.confirmed.length) {

    // Remove old transactions
    result.confirmed.forEach(function(newBlock) {
      var txPoolMap = {};
      self.txPool.forEach(function(tx) {
        txPoolMap[tx.hash] = tx;
      });
      self.blockchain.getBlock(newBlock).transactions.forEach(function(tx) {
        self.txPool.splice(txPoolMap[tx.hash]);
      });
    });

    // Broadcast inv
    this.networking.broadcast('inv', [block.hash]);

    // Update UI
    this.emit('update');

    // Retarget and continue mining
    this.retarget();
    this.miner.startMining();
  }
};

var bn2s = function(bn) {

  var s = bn.toBuffer().toString('hex');
  while (s.length < 64) {
    s = '0' + s;
  }
  return s;
};

Client.prototype.recomputeDifficulty = function() {
  console.log('difficulty retarget triggered...');
  var maxHeight = this.blockchain.getCurrentHeight();
  var first = this.blockchain.getBlock(this.blockchain.hashByHeight[maxHeight - RETARGET_PERIOD]);
  var last = this.blockchain.getBlock(this.blockchain.tip);
  var delta = Math.abs(first.timestamp - last.timestamp);
  var average = delta / RETARGET_PERIOD;
  console.log('\taverage block time', average, 'secs');
  console.log('\texpected block time', DESIRED_BLOCK_TIME, 'secs');

  var currentTarget = last.header.getTargetDifficulty();
  var newTarget = currentTarget
    .div(new BN(DESIRED_RETARGET_TIME))
    .mul(new BN(delta));

  console.log('\tcurrent target', bn2s(currentTarget));
  console.log('\tnew target    ', bn2s(newTarget));

  var bits = BlockHeader.getBits(newTarget);
  this.bits = bits;
  this.miner.bits = bits;
};

Client.prototype.retarget = function() {

  var lookup = [this.miner.target];
  var seen = {};
  seen[Pos.posToString(this.miner.target)] = true;
  var begin = 0;
  var end = 1;
  while (begin < end) {
    var current = lookup[begin++];
    var pos = Pos.posToString(current);
    if (!this.blockchain.pixels[pos]) {
      this.miner.target = current;
      return;
    }
    var neighbors = _.shuffle(Pos.neighbors(current));
    neighbors.map(function(neighbor) {
      var pos = Pos.posToString(neighbor);
      if (!seen[pos]) {
        seen[pos] = true;
        lookup[end++] = neighbor;
      }
    });
  }
};

Client.prototype.makeTransaction = function(position, color) {
  var posStr = Pos.posToString(position);
  var tx = new core.Transaction()
    .from(this.blockchain.pixels[posStr])
    .colored(color)
    .to(this.blockchain.pixels[posStr].owner)
    .sign(this.wallet[this.blockchain.pixels[posStr].owner.toString()]);
  this.addTransaction(tx);
};

Client.prototype.switchMining = function() {
  this.miner.switchMining();
};

Client.prototype.addTransaction = function(tx) {
  $.checkArgument(tx instanceof core.Transaction, 'Invalid type for transaction');
  $.checkArgument(
    core.Transaction.Sighash.verify(
      tx, tx.signature, this.blockchain.pixels[Pos.posToString(tx.position)].owner
    ), 'Invalid signature'
  );

  this.txPool.push(tx);
  this.miner.addTransaction(tx);
  this.emit('update');
};

Client.prototype.setTarget = function(pos) {
  this.miner.setNewTarget(pos);
  this.emit('update');
};

Client.prototype.setFocusPixel = function(pos) {
  this.focusPixel = pos;
  this.emit('update');
};

Client.prototype.getState = function() {
  var self = this;
  var pixelValues = _.values(this.blockchain.pixels);
  var focusPixel = this.focusPixel ? {
    position: this.focusPixel,
    lastTx: this.blockchain.pixels[Pos.posToString(this.focusPixel)]
  } : null;
  return {
    focusPixel: focusPixel,
    pixels: pixelValues,
    controlled: pixelValues.filter(
      function(block) {
        return !!(self.wallet[block.owner]);
      }
    ),
    txPool: this.txPool,
    blocks: this.blockchain.height
  };
};

module.exports = new Client();
