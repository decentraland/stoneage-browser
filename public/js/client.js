'use strict';

var util = require('util');
var events = require('events');

// var Mining = require('./mining');
var MockMining = require('./mockMining');
var Blockchain = require('./blockchain');
var Pos = require('./components/position');
var blockchainjs = require('blockchain.js');
var _ = blockchainjs.deps._;

var GenesisBlock = require('./data/genesis');

function Client() {
  events.EventEmitter.call(this);

  var self = this;

  this.blockchain = new Blockchain();

  this.wallet = {};
  var privateKey = new blockchainjs.PrivateKey();
  this.wallet[privateKey.publicKey.toString()] = privateKey;

  this.blocks = {};
  this.pixels = {};

  this.txPool = [];

  // TODO: Don't use the mock
  this.miner = new MockMining(this);
  this.miner.owner = privateKey.publicKey.toString();

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
  var self = this;
  return {
    pixels: _.values(this.pixels),
    mining: this.miner.properties,
    controlled: _.filter(_.values(this.pixels),
                         function(block) { return !!(self.wallet[block.lastTx.owner]); })
      .map(function(block) { return block.lastTx; }),
    txPool: this.txPool,
    latestBlocks: _.values(this.blocks)
  };
};

module.exports = Client;
