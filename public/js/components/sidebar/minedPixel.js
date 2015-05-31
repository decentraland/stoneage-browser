'use strict';

var React = require('react');
var client = require('../../client');
var Pos = require('../position');

var MinedPixel = React.createClass({
  render: function() {
    // <LatestBlocks blocks={this.props.client.latestBlocks} />
    var controlled = !!client.wallet[
        client.blockchain.pixels[Pos.posToString(this.props.pixel.position)]
      .owner.toString()];
    return (
      <div id="focusPixel">
        <h3>Pixel: {this.props.pixel.position.x}, {this.props.pixel.position.y}</h3>
        <ul>
          <li><strong>Color</strong>: {this.props.pixel.lastTx.color}</li>
          <li><strong>Owner</strong>: {this.props.pixel.lastTx.owner.toString()}</li>
          { controlled ? <li><strong>Controlled</strong></li> : '' }
        </ul>
      </div>
    );
  }
});

module.exports = MinedPixel;
