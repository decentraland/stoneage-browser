'use strict';

var core = require('decentraland-core');
var $ = core.util.preconditions;
var _ = core.deps._;
var events = require('events');
var bufferUtils = core.util.buffer;
var Hash = core.crypto.Hash;
var Transaction = core.Transaction;
var Miner = core.Miner;
var Pos = require('./components/position');
var Block = core.Block;

var util = require('util');
var inherits = util.inherits;

function Mining (opts) {
  $.checkArgument(_.isObject(opts));
  var self = this;

  this.worker = new Worker('./js/webworker.js');

  this.worker.onmessage = function(event) {
    this.mining = false;
    self.emit('block', Block.fromString(event.data));
  };
  this.worker.onerror = function() {
    console.log('error', arguments);
  };

  this.bits = opts.bits || 0x1f0fffff;
  this.client = opts.client;
  this.publicKey = opts.publicKey;
  this.target = opts.target;
  this.color = opts.color;

  this.enableMining = true;
  this.mining = false;
}
inherits(Mining, events.EventEmitter);

Mining.prototype.startMining = function() {

  if (!this.enableMining) {
    return;
  }

  var self = this;
  var opts = {};
  opts.bits = this.bits;
  opts.color = this.color;
  opts.target = this.target;
  opts.publicKey = this.publicKey.toString();
  opts.previous = this.client.blockchain.getTipBlock().toString();
  opts.txPool = this.client.txPool.map(function(tx) { return miner.addTransaction(tx); });

  this.mining = true;
  this.worker.postMessage({
    type: 'MINE',
    payload: opts
  });
};

Mining.prototype.switchMining = function() {
  if (this.enableMining) {
    this.enableMining = false;
    this.pause();
  } else {
    this.enableMining = true;
    this.startMining();
  }
};

Mining.prototype.pauseAndDo = function(what) {
  var wasMining = this.mining;
  if (this.mining) {
    this.pause();
  }
  what.call(this);
  if (wasMining) {
    this.resume();
  }
};

Mining.prototype.setNewTarget = function(target) {
  pauseAndDo(function() {
    this.target = target;
  });
};

Mining.prototype.setNewColor = function(color) {
  pauseAndDo(function() {
    this.color = color;
  });
};

Mining.prototype.setNewPublicKey = function(publicKey) {
  pauseAndDo(function() {
    this.publicKey = publicKey;
  });
};

Mining.prototype.addTransaction = function(transaction) {
  this.worker.postMessage({type: 'ADDTX', payload: transaction.toString()});
};

Mining.prototype.pause = function() {
  this.mining = false;
  this.worker.postMessage({
    type: 'PAUSE'
  });
};
Mining.prototype.resume = function() {
  this.mining = true;
  this.worker.postMessage({
    type: 'RESUME'
  });
};

module.exports = Mining;
