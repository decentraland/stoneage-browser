'use strict';

var core = require('decentraland-core');
var $ = core.util.preconditions;
var _ = core.deps._;
var events = require('events');
var Block = core.Block;
var BlockHeader = core.BlockHeader;

var util = require('util');
var inherits = util.inherits;

// TODO: use var STARTING_BITS = 0x1fefffff;
var STARTING_BITS = BlockHeader.Constants.DEFAULT_BITS;

function Mining(opts) {
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

  this.bits = opts.bits || STARTING_BITS;
  this.client = opts.client;
  this.publicKey = opts.publicKey;
  this.target = opts.target;
  this.color = opts.color;

  this.enableMining = opts.enableMining;
  this.mining = false;
}
inherits(Mining, events.EventEmitter);

Mining.prototype.startMining = function() {

  if (!this.enableMining) {
    return;
  }

  var opts = {};
  opts.bits = this.bits;
  opts.color = this.color;
  opts.target = this.target;
  opts.publicKey = this.publicKey.toString();
  opts.previous = this.client.blockchain.getTipBlock().toString();
  opts.txPool = this.client.txPool.map(function(tx) {
    return tx.toString();
  });

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
    this.startMining();
  }
};

Mining.prototype.setNewTarget = function(target) {
  this.pauseAndDo(function() {
    this.target = target;
  });
};

Mining.prototype.setNewColor = function(color) {
  this.pauseAndDo(function() {
    this.color = color;
  });
};

Mining.prototype.setNewPublicKey = function(publicKey) {
  this.pauseAndDo(function() {
    this.publicKey = publicKey;
  });
};

Mining.prototype.addTransaction = function(transaction) {
  this.worker.postMessage({
    type: 'ADDTX',
    payload: transaction.toString()
  });
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
