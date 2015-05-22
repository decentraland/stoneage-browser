'use strict';

var $ = require('jquery');
var config = require('../config.js');

var neighbors = function(pos) {
  return [
    {x: pos.x -1, y: pos.y},
    {x: pos.x +1, y: pos.y},
    {x: pos.x, y: pos.y - 1},
    {x: pos.x, y: pos.y + 1}
  ];
};

var posToString = function(pos) {
  return pos.x + '_' + pos.y;
};
var posToHumanString = function(pos) {
  return pos.x + ', ' + pos.y;
};

var width = $(document).width();
var height = $(document).height();

var tilePositionTop = function(y) {
  return (height - config.tileHeight) / 2
    - y * config.tileHeight
    - y * config.tileSeparation;
};
var tilePositionLeft = function(x) {
  return (width - config.tileWidth) / 2
    + x * config.tileHeight
    + x * config.tileSeparation;
};

module.exports = {
  neighbors: neighbors,

  posToString: posToString,
  posToHumanString: posToHumanString,

  tilePositionLeft: tilePositionLeft,
  tilePositionTop: tilePositionTop,

  width: width,
  height: height
};

