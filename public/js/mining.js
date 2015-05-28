'use strict';

var core = require('decentraland-core');
var $ = core.util.preconditions;
var _ = core.deps._;
var Transaction = core.Transaction;
var Miner = core.Miner;
var Pos = require('./components/position');

function Mining (opts) {
  $.checkArgument(_.isObject(opts));

  this.blockchain = opts.blockchain;
  this.nonce = opts.nonce || 0;
  this.publicKey = opts.publicKey;
  this.target = opts.target;
  this.color = opts.color;
  this.txPool = opts.txPool;
  this.callback = opts.callback;
}

Mining.prototype.startMining = function() {

  var self = this;
  var opts = {};

  if (this.target === null) {
    console.log('No target');
    throw new Error('No target');
  }

  opts.coinbase = new Transaction()
    .at(this.target.x, this.target.y)
    .to(this.publicKey)
    .colored(this.color);

  opts.previous = this.blockchain.getTipBlock();
  opts.time = Math.round(new Date() / 1000);
  opts.bits = 0x1f0fffff;

  var miner = this.miner = new Miner(opts);
  this.txPool.map(function(tx) { return miner.addTransaction(tx); });

  var newTarget = function(block) {
    self.target = null;
    var base = block.transactions[0].position;
    _.shuffle(Pos.neighbors(base)).map(function(pos) {
      if (!self.blockchain.pixels[Pos.posToString(pos)]) {
        self.target = pos;
      }
    });
  };

  miner.on('block', function(block) {
    newTarget(block);
    if (self.target !== null) {
      miner.newTip(block, new Transaction()
        .at(self.target.x, self.target.y)
        .to(self.publicKey)
        .colored(self.color)
      );
    }
    self.callback(block);
  });
  miner.run();
};

Mining.prototype.addTransaction = function(transaction) {
  this.miner.addTransaction(transaction);
};

module.exports = Mining;
