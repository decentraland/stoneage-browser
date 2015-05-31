'use strict';

var util = require('util');
var events = require('events');

var core = require('decentraland-core');
var Block = core.Block;
var Blockchain = core.Blockchain;
var Miner = require('./mining');
var Networking = require('./networking');
var config = require('./config.js');
var Pos = require('./components/position');
var _ = core.deps._;
var $ = core.util.preconditions;

function Client() {
  events.EventEmitter.call(this);
  var self = this;

  this.blockchain = new Blockchain();
  this.blockchain.proposeNewBlock(Block.genesis);

  var wallet = localStorage.getItem('privateKeys');
  if (!wallet) {
    this.wallet = {};
    var privateKey = new core.PrivateKey();
    this.wallet[privateKey.publicKey.toString()] = privateKey;
    this.keys = [privateKey.publicKey];
    localStorage.setItem('privateKeys', JSON.stringify(
      _.values(self.wallet).map(function(privateKey) {
        return privateKey.toString();
      })
    ));
  } else {
    this.wallet = {};
    this.keys = [];
    var privateKeys = JSON.parse(wallet);
    privateKeys.forEach(function(privateKey) {
      var privateKey = new core.PrivateKey(privateKey);
      self.wallet[privateKey.publicKey.toString()] = privateKey;
      self.keys.push(privateKey.publicKey.toString());
    });
  }

  //allow setting peer id from url
  config.networking.id = window.location.hash.substring(1) || config.networking.id;
  this._setupNetworking();

  this.txPool = [];
  this.focusPixel = null;

  var enableMining = this.networking.id === 'seed-livenet-maraoz';
  this.miner = new Miner({
    client: this,
    publicKey: this.keys[0],
    target: {
      x: 0,
      y: 1
    },
    color: 0xff0000,
    txPool: this.txPool,
    callback: this.receiveBlock.bind(this),
    enableMining: enableMining,
  });
  this.miner.on('block', this.receiveBlock.bind(this));

  this.miner.startMining();
}
util.inherits(Client, events.EventEmitter);

Client.prototype._setupNetworking = function() {

  var networking = new Networking(config.networking);
  var self = this;
  var after = {};

  networking.on('connection', function(peerID) {
    console.log('new connection', peerID);
    networking.send(peerID, 'getblocks', self.blockchain.getBlockLocator());
  });

  networking.on('inv', function(peerID, inv) {
    console.log('inv from peer', peerID, inv);
    inv.forEach(function(hash) {
      var block = self.blockchain.getBlock(hash);
      if (block) {
        return;
      }
      networking.send(peerID, 'get', inv);
    });
  });

  networking.on('get', function(peerID, inv) {
    console.log('get from peer', peerID, inv);
    var block = self.blockchain.getBlock(inv);
    if (block) {
      networking.send(peerID, 'block', block.toBuffer().toString('hex'));
    }
  });

  networking.on('getblocks', function(peerID, inv) {
    console.log('getblocks from peer', peerID, inv);
    var last = inv.length - 1;
    while (last >= 0 && _.isUndefined(self.blockchain.height[inv[last]])) {
      last--;
    }
    var first;
    if (last === -1) {
      first = Block.genesis.hash;
    } else {
      first = inv[last];
    }
    first = self.blockchain.next[first];
    var blocks = [];
    while (blocks.length < 50 && self.blockchain.next[first]) {
      blocks.push(first);
      first = self.blockchain.next[first];
    }
    networking.send(peerID, 'inv', blocks);
  });

  networking.on('block', function(peerID, block) {
    console.log('block from peer', peerID, block);
    
    var unserialized = Block.fromBuffer(block);

    if (!self.blockchain.getBlock(unserialized.prevHash)) {

      // No previous hash; ask it and store block to process later
      after[unserialized.prevHash] = unserialized;

    } else {

      self.receiveBlock(unserialized, peerID);
      var hash = unserialized.hash;

      // Process queued blocks
      while (after[hash]) {
        unserialized = after[unserialized.hash];
        self.receiveBlock(unserialized, peerID);
        delete after[hash];
        hash = unserialized.hash;
      }
    }
    networking.send(peerID, 'getblocks', self.blockchain.getBlockLocator());

  });

  networking.start();
  this.networking = networking;
};

Client.prototype.receiveBlock = function(block, peerID) {
  var result;
  var self = this;

  var hasPrev = this.blockchain.hasData(block.prevHash);
  if (!hasPrev) {
    this.networking.send(peerID, 'get', block.prevHash);
    return;
  }
  try {
    result = this.blockchain.proposeNewBlock(block);
  } catch (e) {
    console.log('Invalid block', block.id, 'from peer', peerID, e);
    //this.networking.closeConnection(peerID);
    return;
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
  this.miner.setTarget(pos);
  this.emit('update');
};

Client.prototype.getState = function() {
  var self = this;
  var pixelValues = _.values(this.blockchain.pixels);
  return {
    pixels: pixelValues,
    mining: this.miner,
    controlled: pixelValues.filter(
      function(block) {
        return !!(self.wallet[block.owner]);
      }
    ),
    txPool: this.txPool,
    blocks: this.blockchain.height,
    focusPixel: this.focusPixel,
    makeTx: this.makeTransaction.bind(this)
  };
};

module.exports = new Client();
