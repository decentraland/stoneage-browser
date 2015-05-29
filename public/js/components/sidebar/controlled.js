'use strict';

var React = require('react');

var Pos = require('../position');
var ControlledParcel = require('./controlledParcel');

var Controlled = React.createClass({
  render: function() {
    var parcels = [];
    var self = this;
    this.props.controlled.forEach(function(pixel) {
      var key = 'controlled_land_' + Pos.posToString(pixel.position);
      parcels.push(<ControlledParcel
                     key={key}
                     pixel={pixel}
                     client={self.props.client}
                   />);
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
