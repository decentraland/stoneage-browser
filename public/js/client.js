'use strict';

var util = require('util');
var events = require('events');

// var Mining = require('./mining');
var MockMining = require('./mockMining');
var Blockchain = require('./blockchain');
var Pos = require('./components/position');

var GenesisBlock = require('./data/genesis');

function Client() {
  events.EventEmitter.call(this);

  var self = this;

  this.blockchain = new Blockchain();

  this.blocks = {};
  this.pixels = {};

  // TODO: These have no function right now
    this.txPool = [];
    this.lastBlocks = [];

  this.miner = new MockMining(this);
  this.miner.on('new', this.receiveBlock.bind(this));
  this.receiveBlock(GenesisBlock);
}
util.inherits(Client, events.EventEmitter);

Client.prototype.receiveBlock = function(block) {
  var self = this;
  // TODO: validate block has valid transactions and proof of work
  var result = this.blockchain.proposeNewBlock(block);
  this.blocks[block.hash] = block;

  result.confirmed.forEach(function(hash) {
    var block = self.blocks[hash]
    var coinbase = block.transactions[0];
    self.pixels[Pos.posToString(coinbase.position)] = {
      pos: coinbase.position,
      lastTx: coinbase
    };
    // TODO: other transactions
  });
  // TODO: this.blockchain.onUnconfirmBlock
  this.emit('update');
};

Client.prototype.getState = function() {
  return {
    pixels: this.pixels,
    mining: this.miner.properties,
    // TODO: Wallet, TX pool, history of blocks?
    controlled: [],
    txPool: [],
    latestBlocks: []
  };
};

module.exports = Client;
