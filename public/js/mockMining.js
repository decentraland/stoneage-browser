'use strict';

var inherits = require('util').inherits;
var events = require('events');

var blockchainjs = require('blockchain.js');

var Pos = require('./components/position');

var genesis = require('./data/genesis');

function MockMining(client) {
  this.properties = {
    targetPos: { x: 2, y: 0 },
    difficulty: 4,
    publicKey: '03000...000',
    color: 'FF00FF'
  };
  this.client = client;

  setInterval(this.fakeBlock.bind(this), 1000);
}
inherits(MockMining, events.EventEmitter);

MockMining.prototype.fakeBlock = function() {
  var used = {};
  var unminedTargets = [];
  var unmined = []

  client.pixels.forEach(function(pixel) {
    var posStr = Pos.posToString(pixel.pos);
    used[posStr] = true;
    Pos.neighbors(pixel.pos).forEach(function(neighbor) {
      unmined.push(neighbor);
    });
  });
  unmined.forEach(function(pos) {
    var posStr = Pos.posToString(pos);
    if (!used[posStr]) {
      unmined.push(pos);
    }
  });
  if (used[posStr]) {
    this.properties.targetPos = unmined[0];
  }

  var randomBlock = {
    prevHash: this.client.blockchain.tip,
    hash: blockchainjs.crypto.getRandomBuffer(32).toString('hex'),
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
  this.properties.targetPos = unmined[unmined.length - 1];
  this.emit('new', randomBlock);
  return randomBlock;
};

module.exports = MockMining;
