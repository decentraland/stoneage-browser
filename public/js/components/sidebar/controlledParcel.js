'use strict';

var React = require('react');
var Pos = require('../position');

var client = require('../../client');

var ControlledParcel = React.createClass({
  getInitialState: function() {
    return {
      color: this.props.pixel.color
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
    var pos = Pos.posToHumanString(this.props.pixel.position);
    var color = this.state.color.toString(16).substr(0, 6);
    while (color.length < 6) {
      color = '0' + color;
    }
    color = '#' + color;
    return (
      <li><strong>{pos}</strong>:
        <input
          type="color"
          value={color}
          onChange={this.setColor}
        />
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={this.craftTx}
        >Change</button>
      </li>
    );
  }
});

module.exports = ControlledParcel;
