'use strict';

var React = require('react');
var Pos = require('../position');

var client = require('../../client');

var ControlledParcel = React.createClass({
  craftTx: function() {
  },
  render: function() {
    var pos = Pos.posToHumanString(this.props.pixel.position);
    var color = '#' + this.props.pixel.color.toString(16).substr(0, 6);
    return (
      <li><strong>{pos}</strong>:
        <input
          type="color"
          value={color} />
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
