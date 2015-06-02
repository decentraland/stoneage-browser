'use strict';

var window = {};
window.Object = Object;
window.String = String;
window.RegExp = RegExp;
window.Math = Math;
window.Function = Function;
window.Array = Array;
window.Date = Date;
window.parseInt = parseInt;
window.parseFloat = parseFloat;
window.crypto = crypto;

importScripts('decentraland-core.js');
var core = require('decentraland-core');
var $ = core.util.preconditions;
var _ = core.deps._;
var PublicKey = core.PublicKey;
var Transaction = core.Transaction;
var Block = core.Block;
var Miner = core.Miner;

var miner;

// Worker control
var minerTimeout = 0;

var mine = function(opts) {
  miner.on('block', function(block) {
    postMessage(block.toString());
  });
};

var nextBlock = function() {
  var block = miner.work();
  if (!block) {
    minerTimeout = setTimeout(nextBlock, 0);
  }
};

var addTx = function(tx) {
  if (miner) {
    pause();
    miner.addTransaction(tx);
    resume();
  }
};

var pause = function() {
  clearTimeout(minerTimeout);
};

var resume = function() {
  nextBlock();
};

/**
 * Does message handling and sanitization
 */
onmessage = function(e) {
  var event = e.data;

  if (event.type === 'MINE') {
    var opts = event.payload;
    $.checkArgument(!_.isUndefined(opts.target), 'opts.target must not be undefined');
    $.checkArgument(!_.isUndefined(opts.target.x), 'opts.target.x must not be undefined');
    $.checkArgument(!_.isUndefined(opts.target.y), 'opts.target.y must not be undefined');
    $.checkArgument(!_.isUndefined(opts.publicKey), 'opts.publicKey must not be undefined');
    $.checkArgument(!_.isUndefined(opts.color), 'opts.color must not be undefined');
    $.checkArgument(!_.isUndefined(opts.previous), 'opts.previous must not be undefined');
    $.checkArgument(!_.isUndefined(opts.bits), 'opts.bits must not be undefined');
    //console.log('mining at difficulty bits', opts.bits.toString(16));

    opts.publicKey = new PublicKey(opts.publicKey);
    $.checkArgument(
      opts.color >= 0 && opts.color <= 0xFFFFFF, 'Invalid color, must be an int from 0x0 to 0xFFFFFF'
    );
    opts.coinbase = new Transaction()
      .at(opts.target.x, opts.target.y)
      .to(opts.publicKey)
      .colored(opts.color);
    opts.previous = Block.fromString(opts.previous);

    miner = new Miner(opts);
    opts.txPool.map(function(tx) {
      return miner.addTransaction(new Transaction(tx));
    });

    mine(opts);
    resume();

  } else if (event.type === 'ADDTX') {
    addTx(new Transaction(event.payload));
  } else if (event.type === 'PAUSE') {
    pause();
  } else if (event.type === 'RESUME') {
    resume();
  } else {
    throw new Error('invalid message type');
  }
};
