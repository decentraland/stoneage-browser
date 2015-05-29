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
    var buttonText = this.props.mining.enableMining ? 'Disable' : 'Enable';
    var mining = this.props.mining.enableMining ? 'Mining' : 'Not Mining';
    var buttonClass = this.props.mining.enableMining ? 'btn-warning' : 'btn-success';
    return (
      <div>
        <h2>Status</h2>
        <ul>
          <li>
            <strong>{mining}</strong>
            <button
              onClick={this.switchMiner}
              className="btn {buttonClass}"
            >
              {buttonText}
            </button>
          </li>
          <li><strong>Mining Target</strong>: {this.props.mining.target.x}, {this.props.mining.target.y}</li>
          <li><strong>Current Difficulty</strong>: {this.props.mining.difficulty}</li>
          <li><strong>Target Color</strong>: {this.props.mining.color}</li>
          <li><strong>Public Key</strong>: {this.props.mining.publicKey.toString()}</li> 
        </ul>
      </div>
    );
  }
});

module.exports = Mining;
