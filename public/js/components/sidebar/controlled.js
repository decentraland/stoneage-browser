'use strict';

var React = require('react');

var Pos = require('../position');
var ControlledParcel = require('./controlledParcel');

var Controlled = React.createClass({
  render: function() {
    var parcels = [];
    this.props.controlled.forEach(function(pixel) {
      var key = 'controlled_land_' + Pos.posToString(pixel.pos);
      parcels.push(<ControlledParcel key={key} pixel={pixel} />);
    });
    return (
      <div>
        <h3>Controlled Parcels</h3>
        <ul>{parcels}</ul>
      </div>
    );
  }
});

module.exports = Controlled;
