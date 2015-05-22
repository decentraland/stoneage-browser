'use strict';

var React = require('react');
var PageConstructor = require('./components/page');
var $ = require('jquery');

var pixels = [{
  pos: { x: 0, y: 0 },
  lastTx: {
    color: 'FF0000',
    owner: 'Nobody',
    timestamp: '1432150452'
  }
}, {
  pos: { x: 1, y: 0},
  lastTx: {
    color: '00FF00',
    owner: '03000...000',
    timestamp: '1432150452'
  }
}, {
  pos: { x: 1, y: 1},
  lastTx: {
    color: '00FF00',
    owner: '03000...000',
    timestamp: '1432150452'
  }
}, {
  pos: { x: 1, y: -1},
  lastTx: {
    color: '00FF00',
    owner: '03000...000',
    timestamp: '1432150452'
  }
}, {
  pos: { x: -1, y: 0},
  lastTx: {
    color: '0000FF',
    owner: '03ABC...789',
    timestamp: '1432150452'
  }
}];

var clientData = {
  mining: {
    targetPos: { x: 2, y: 0 },
    difficulty: 4,
    publicKey: '03000...000',
    color: 'FF00FF'
  },
  controlled: [
    {
      pos: { x: 0, y: 1 },
      color: '00FF00'
    }
  ],
  txPool: [
    {
      pos: { x: 1, y: 1 },
      publicKey: '03AAA...BBB',
      color: '00FF00'
    }
  ],
  latestBlocks: [
    {
      id: '00AAAAAA',
      height: 4
    },
    {
      id: '00BBBBBB',
      height: 3
    },
    {
      id: '00CCCCCC',
      height: 2
    },
    {
      id: '00DDDDDD',
      height: 1
    },
    {
      id: '00000000',
      height: 0
    }
  ],
  pixels: pixels
};

React.render(PageConstructor({
  getState: function() { return clientData; }
}), document.getElementById('content'));
