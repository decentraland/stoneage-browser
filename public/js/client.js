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

var randomcolor = require('randomcolor');

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
      _.values(self.wallet).map(function(privateKey) { return privateKey.toString(); })
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

  this.txPool = [];
  this.focusPixel = null;

  this.miner = new Miner({
    client: this,
    publicKey: this.keys[0],
    target: {
      x: 0,
      y: 1
    },
    color: 0xff0000,
    txPool: this.txPool,
    callback: this.receiveBlock.bind(this)
  });
  this.miner.on('block', this.receiveBlock.bind(this));
  this.miner.startMining();

  config.networking.metadata = {
    height: 0,
  };

  //allow setting peer id from url
  config.networking.id = config.networking.id || window.location.hash.substring(1);

  this._setupNetworking();
}
util.inherits(Client, events.EventEmitter);

Client.prototype._setupNetworking = function() {

  var networking = new Networking(config.networking);

  networking.on('connection', function(peerID) {
    var n = networking.getConnectedPeers();
    console.log('Connected peers', n);
    networking.send(peerID, 'inv', 'hi');
  });
  networking.on('inv', function(inv) {
    console.log('inv', inv);
  });

  networking.start();
  this.networking = networking;
};

Client.prototype.receiveBlock = function(block) {
  var self = this;
  var result;

  try {
    result = this.blockchain.proposeNewBlock(block);
  } catch (e) { 
    // TODO: Close connection with whomever sent this
    console.log('Invalid block', e);
    return;
  }

  console.log('Mined', block.hash, block.nonce);
  if (result.confirmed.length) {
    config.networking.metadata = {
      height: block.height,
    };
    this.retarget();
    this.emit('update');
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
    focusPixel: this.focusPixel
  };
};

module.exports = new Client();
