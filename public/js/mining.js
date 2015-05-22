var blockchainjs = require('blockchain.js');
var $ = blockchainjs.util.preconditions;
var _ = blockchainjs.deps._;
var bufferUtils = blockchainjs.util.buffer;
var Hash = blockchainjs.crypto.Hash;

function Mining (opts) {
  $.checkArgument(_.isObject(opts));

  this.nonce = opts.nonce || 0;
  this.template = null;
  this.txTemplate = null;

  // this.targetPos = opts.targetPos;
  this.version = 1;
  this.difficulty = opts.difficulty;
  this.publicKey = opts.publicKey;
  this.color = opts.color;
  this.prevHash = opts.prevHash;
  this.height = opts.height;
  this.txPool = opts.txPool;
  this.timestamp = null;

  this.setStop = null;
}

Mining.prototype.startMining = function(callback) {

  if (this.miningTimeoutId) {
    this.stopMining();
  }
  this.timestamp = Math.round(new Date().getTime() / 1000);

  this.template = Buffer.concat([
    bufferUtils.integerAsBuffer(this.version),
    bufferUtils.integerAsBuffer(this.difficulty),
    bufferUtils.integerAsBuffer(this.height),
    new Buffer(this.prevHash, 'hex'),
    bufferUtils.integerAsBuffer(this.timestamp),
    // nonce,
    // transactions
  ]);
  this.txTemplate = Buffer.concat(
    this.txPool.map(function(tx) { return tx.toBuffer(); })
  );
  this.nonce = 0;
  this.callback = callback;
  this.tryMining();
};

var getWork = function(hash) {
  var i = 0;
  while (hash[i] === 0) i++;
  return i;
};

Mining.prototype.tryMining = function() {
  if (this.setStop) {
    this.setStop = null;
    return;
  }
  var block = Buffer.concat([
    this.template,
    bufferUtils.integerAsBuffer(this.nonce++),
    bufferUtils.integerAsBuffer(this.txTemplate.length),
    this.txTemplate
  ]);
  var hash = Hash.sha256sha256(block);
  var work = getWork(hash);

  if (work > this.difficulty) {
    if (this.callback) {
      this.callback(block, hash, work);
    }
  } else {
    process.nextTick(this.tryMining.bind(this));
  }
};

Mining.prototype.stopMining = function() {
  if (this.setStop !== null) {
    this.setStop = true;
  }
};

module.exports = Mining;
