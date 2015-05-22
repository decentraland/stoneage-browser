'use strict';

var inherits = require('util').inherits;
var events = require('events');

var randomcolor = require('randomcolor');
var blockchainjs = require('blockchain.js');
var _ = blockchainjs.deps._;

var Pos = require('./components/position');

var genesis = require('./data/genesis');

function MockMining(client) {
  this.properties = {
    targetPos: { x: 1, y: 0 },
    difficulty: 4,
    publicKey: '03000...000',
    color: randomcolor().substr(1, 7)
  };
  this.client = client;

  setInterval(this.fakeBlock.bind(this), 50);
}
inherits(MockMining, events.EventEmitter);

MockMining.prototype.fakeBlock = function() {
  var used = {};
  var unminedTargets = [];
  var unmined = []

  _.values(this.client.pixels).forEach(function(pixel) {
    var posStr = Pos.posToString(pixel.pos);
    used[posStr] = true;
    Pos.neighbors(pixel.pos).forEach(function(neighbor) {
      unminedTargets.push(neighbor);
    });
  });
  unminedTargets.forEach(function(pos) {
    var posStr = Pos.posToString(pos);
    if (!used[posStr]) {
      unmined.push(pos);
    }
  });
  if (used[Pos.posToString(this.properties.targetPos)]) {
    this.properties.targetPos = unmined[Math.floor(Math.random() * unmined.length)];
  }

  var randomBlock = {
    prevHash: this.client.blockchain.tip,
    hash: blockchainjs.crypto.Random.getRandomBuffer(32).toString('hex'),
    height: this.client.blockchain.height[this.client.blockchain.tip],
    nonce: 0,
    transactions: [{
      version: 1,
      input: '',
      position: this.properties.targetPos,
      color: this.properties.color,
      owner: new blockchainjs.PrivateKey().publicKey.toString()
    }]
  };
  this.properties.targetPos = unmined[Math.floor(Math.random() * unmined.length)];
  this.properties.color = randomcolor().substr(1, 7)
  this.emit('new', randomBlock);
  return randomBlock;
};

module.exports = MockMining;
