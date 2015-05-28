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
  this.keys = [privateKey.publicKey.toString()];

  this.blocks = {};
  this.pixels = {};
  this.pixelValues = [];

  this.txPool = [];
  this.focusTx = null;

  // TODO: Don't use the mock
  this.miner = new MockMining(this);
  this.miner.owner = privateKey.publicKey.toString();

  this.miner.on('new', this.receiveBlock.bind(this));
  this.receiveBlock(GenesisBlock);
}
util.inherits(Client, events.EventEmitter);

Client.prototype.receiveBlock = function(block) {
  var self = this;
  if (this.blockchain.isInvalidBlock(block)) {
    // TODO: Close connection with whomever sent this
    return;
  }
  var result = this.blockchain.proposeNewBlock(block);
  this.blocks[block.hash] = block;

  result.confirmed.forEach(function(hash) {
    var block = self.blocks[hash]
    var coinbase = block.transactions[0];
    self.pixelValues.push(self.pixels[Pos.posToString(coinbase.position)] = {
      pos: coinbase.position,
      lastTx: coinbase
    });
    for (var i = 1; i < block.transactions.length; i++) {
      var transaction = block.transactions[i];
      self.pixels[Pos.posToString(transaction.position)].lastTx = transaction;
      self.pixels[Pos.posToString(transaction.position)].pos = transaction.pos;
    }
  });
  // TODO: this.blockchain.onUnconfirmBlock
  this.emit('update');
};

Client.prototype.getState = function() {
  var self = this;
  return {
    pixels: this.pixelValues,
    mining: this.miner.properties,
    controlled: this.pixelValues.filter(
      function(block) { return !!(self.wallet[block.lastTx.owner]); }
    ),
    txPool: this.txPool,
    latestBlocks: _.values(this.blocks),
    focusTx: this.focusTx
  };
};

module.exports = new Client();
