'use strict';

var React = require('react');
var client = require('../../client');

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
    client.setNewColor(color);
    this.setState(this.getInitialState());
  },
  render: function() {
    var buttonText = this.state.mining ? 'Mining Enabled' : 'Mining Disabled';
    var buttonClass = 'btn btn-sm ' + (this.state.mining ? 'btn-success' : 'btn-warning');
    var bits = '0x' + client.miner.bits.toString(16);
    var color = this.state.color.toString(16);
    var publicKey = client.miner.publicKey.toString();
    publicKey = publicKey.substr(0, 6) + '...' + publicKey.substr(publicKey.length - 4, 4);
    while (color.length < 6) {
      color = '0' + color;
    }
    color = '#' + color;
    return (
      <div>
        <h2>Status</h2>
        <ul>
          <li>
            <button
              onClick={this.switchMining}
              className={buttonClass}
            >
              {buttonText}
            </button>
          </li>
          <li><strong>Mining Target</strong>: {client.miner.target.x}, {client.miner.target.y}</li>
          <li><strong>Current Difficulty</strong>: {bits}</li>
          <li>
            <strong>Target Color</strong>:
            <input
              type="color"
              value={color}
              onChange={this.changeTargetColor}
            />
          </li>
          <li><strong>Public Key</strong>: {publicKey}</li> 
        </ul>
      </div>
    );
  }
});

module.exports = Mining;
