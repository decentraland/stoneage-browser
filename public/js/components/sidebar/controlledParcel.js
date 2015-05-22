'use strict';

var React = require('react');
var Pos = require('../position');

var ControlledParcel = React.createClass({
  render: function() {
    var pos = Pos.posToHumanString(this.props.pixel.pos);
    var color = '#' + this.props.pixel.color;
    return (
      <li><strong>{pos}</strong>:
        <input
          type="color"
          value={color} />
        <button
          type="button"
          className="btn btn-primary btn-sm">Change</button>
      </li>
    );
  }
});

module.exports = ControlledParcel;
