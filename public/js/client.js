'use strict';

var util = require('util');
var events = require('events');

var Pos = require('./components/position');
var blockchainjs = require('blockchain.js');
var Block = blockchainjs.Block;
var Blockchain = blockchainjs.Blockchain;
var Miner = require('./mining');
var _ = blockchainjs.deps._;

var randomcolor = require('randomcolor');

function Client() {
  events.EventEmitter.call(this);

  var self = this;

  this.blockchain = new Blockchain();
  this.blockchain.proposeNewBlock(Block.genesis);

  this.wallet = {};
  var privateKey = new blockchainjs.PrivateKey();
  this.wallet[privateKey.publicKey.toString()] = privateKey;
  this.keys = [privateKey.publicKey];

  this.txPool = [];
  this.focusPixel = null;

  this.miner = new Miner({
    blockchain: this.blockchain,
    publicKey: this.keys[0],
    target: {x: 0, y: 1},
    color: 0xff000000,
    txPool: this.txPool,
    callback: this.receiveBlock.bind(this)
  });
  this.miner.startMining();
}
util.inherits(Client, events.EventEmitter);

Client.prototype.receiveBlock = function(block) {
  var self = this;
  var result = this.blockchain.proposeNewBlock(block);
  // if (this.blockchain.isInvalidBlock(block)) {
  // TODO: Close connection with whomever sent this
  //  return;
  // }
  console.log('Mined', block.hash, block.nonce);
  if (result.confirmed.length) {
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
      function(block) { return !!(self.wallet[block.owner]); }
    ),
    txPool: this.txPool,
    blocks: this.blockchain.height,
    focusPixel: this.focusPixel
  };
};

module.exports = new Client();
