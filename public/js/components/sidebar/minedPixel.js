'use strict';

var React = require('react');
var client = require('../../client');
var Pos = require('../position');

var MinedPixel = React.createClass({
  getInitialState: function() {
    return {
      color: this.props.pixel.lastTx.color
    };
  },
  setColor: function(event) {
    this.setState({
      color: parseInt(event.nativeEvent.target.value.substr(1, 6), 16)
    });
  },
  craftTx: function() {
    client.makeTransaction(this.props.pixel.position, this.state.color);
  },
  render: function() {
    var controlled = !!client.wallet[
      client.blockchain.pixels[Pos.posToString(this.props.pixel.position)].owner
    ];
    var color = this.state.color.toString(16).substr(0, 6);
    while (color.length < 6) {
      color = '0' + color;
    }
    color = '#' + color;
    var owner = this.props.pixel.lastTx.owner.toString();
    owner = owner.substr(0, 6) + '...' + owner.substr(-4, 4);
    return (
      <div id="focusPixel">
        <h3>Pixel: {this.props.pixel.position.x}, {this.props.pixel.position.y}</h3>
        <div className="row">
          <div className="col-md-6 leftcol">
            Color
          </div>
          <div className="col-md-6">
            <input
              type="color"
              value={color}
              onChange={this.setColor}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 leftcol">
            Owner
          </div>
          <div className="col-md-6">
            {owner}
          </div>
        </div>
        <div className="row change">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={this.craftTx}
          >Change</button>
        </div>
      </div>
    );
  }
});

module.exports = MinedPixel;
