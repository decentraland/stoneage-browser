'use strict';

var React = require('react');

var Mining = React.createClass({
  getInitialState: function() {
    return {
      mining: this.props.mining.enableMining
    };
  },
  switchMiner: function() {
    this.props.mining.switchMining();
    this.setState(this.getInitialState());
  },
  render: function() {
    var buttonText = this.state.mining ? 'Mining Enabled' : 'Mining Disabled';
    var buttonClass = 'btn btn-sm ' + (this.state.mining ? 'btn-success' : 'btn-warning');
    var bits = '0x' + this.props.mining.bits.toString(16);
    var color = this.props.mining.color.toString(16);
    var publicKey = this.props.mining.publicKey.toString();
    publicKey = publicKey.substr(0, 6) + '...' + publicKey.substr(publicKey.length - 4, 4);
    while (color.length < 6) {
      color = '0' + color;
    }
    color = '0x' + color;
    return (
      <div>
        <h2>Status</h2>
        <ul>
          <li>
            <button
              onClick={this.switchMiner}
              className={buttonClass}
            >
              {buttonText}
            </button>
          </li>
          <li><strong>Mining Target</strong>: {this.props.mining.target.x}, {this.props.mining.target.y}</li>
          <li><strong>Current Difficulty</strong>: {bits}</li>
          <li><strong>Target Color</strong>: {color}</li>
          <li><strong>Public Key</strong>: {publicKey}</li> 
        </ul>
      </div>
    );
  }
});

module.exports = Mining;
