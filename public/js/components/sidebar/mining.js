'use strict';

var React = require('react');
var client = require('../../client');

var Toggle = require('react-toggle');

var Mining = React.createClass({
  getInitialState: function() {
    return {
      mining: client.miner.enableMining,
      color: client.miner.color
    };
  },
  switchMining: function() {
    client.switchMining();
    this.setState(this.getInitialState());
  },
  changeTargetColor: function(event) {
    var color = parseInt(event.nativeEvent.target.value.substr(1, 6), 16);
    client.miner.setNewColor(color);
    this.setState(this.getInitialState());
  },
  render: function() {
    var checked = !!this.state.mining;
    var color = this.state.color.toString(16);
    while (color.length < 6) {
      color = '0' + color;
    }
    color = '#' + color;
    return (
      <div className="section">
        <div className="row">
          <div className="col-md-6 leftcol">
            Mining
          </div>
          <div className="col-md-6">
            <Toggle
              defaultChecked={checked}
              onChange={this.switchMining}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 leftcol">
            Mining Color
          </div>
          <div className="col-md-6">
            <input
              type="color"
              value={color}
              onChange={this.changeTargetColor}
            />
          </div>
        </div>
      </div>
    );
    /*
          <div className="row">
            <div className="col-md-6 leftcol">
              Time Between Pixels
            </div>
            <div className="col-md-6">
              10 seconds
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 leftcol">
              Your productivity
            </div>
            <div className="col-md-6">
              2 minutes per pixel
            </div>
          </div>
          */
  }
});

module.exports = Mining;
