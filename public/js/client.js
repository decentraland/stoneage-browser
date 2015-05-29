'use strict';

var util = require('util');
var events = require('events');

var core = require('decentraland-core');
var Block = core.Block;
var Blockchain = core.Blockchain;
var Miner = require('./mining');
var Networking = require('./networking');
var config = require('./config.js');
var _ = core.deps._;

var randomcolor = require('randomcolor');

function Client() {
  events.EventEmitter.call(this);

  this.blockchain = new Blockchain();
  this.blockchain.proposeNewBlock(Block.genesis);

  this.wallet = {};
  var privateKey = new core.PrivateKey();
  this.wallet[privateKey.publicKey.toString()] = privateKey;
  this.keys = [privateKey.publicKey];

  this.txPool = [];
  this.focusPixel = null;

  this.miner = new Miner({
    blockchain: this.blockchain,
    publicKey: this.keys[0],
    target: {
      x: 0,
      y: 1
    },
    color: 0xff000000,
    txPool: this.txPool,
    callback: this.receiveBlock.bind(this)
  });
  //this.miner.startMining();

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
  var result = this.blockchain.proposeNewBlock(block);
  // if (this.blockchain.isInvalidBlock(block)) {
  // TODO: Close connection with whomever sent this
  //  return;
  // }
  console.log('Mined', block.hash, 'nonce=', block.nonce);
  if (result.confirmed.length) {
    config.networking.metadata = {
      height: block.height,
    };
    this.emit('update');
    this.miner.color = parseInt(randomcolor().substr(1, 7), 16) * 256;
    setTimeout(this.miner.startMining.bind(this.miner), 100);
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
