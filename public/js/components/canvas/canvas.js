'use strict';

var React = require('react');

var Pixel = require('./pixel');
var Unmined = require('./unmined');
var Pos = require('../position.js');

var Canvas = React.createClass({
  render: function() {
    var used = {};
    var unmined = [];
    var pixels = [];
    var self = this;
    var lastTxMap = {};
    this.props.client.txPool.map(function(tx) {
      lastTxMap[Pos.posToString(tx.position)] = tx;
    });
    this.props.pixels.forEach(function(pixel) {
      var posStr = Pos.posToString(pixel.position);
      used[posStr] = true;
      pixel = lastTxMap[posStr] || pixel;
      posStr = 'pixel_' + posStr;
      pixels.push(
        <Pixel key={posStr} pixel={pixel} />
      );
      Pos.neighbors(pixel.position).forEach(function(neighbor) {
        unmined.push(neighbor);
      });
    });
    unmined.forEach(function(pos) {
      var posStr = Pos.posToString(pos);
      if (!used[posStr]) {
        used[posStr] = true;
        posStr = 'unmined_' + posStr;
        pixels.push(
          <Unmined key={posStr} pos={pos} />
        );
      }
    });

    return (
      <div id="canvas">
        {pixels}
      </div>
    );
  }
});

module.exports = Canvas;
