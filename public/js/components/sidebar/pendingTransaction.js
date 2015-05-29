'use strict';

var React = require('react');

var Pos = require('../position');

var PendingTransaction = React.createClass({
  render: function() {
    var pos = Pos.posToHumanString(this.props.tx.position);
    var newPublic = this.props.tx.owner.toString();
    var newColor = this.props.tx.color;
    return (
      <li><strong>{pos}</strong>: {newPublic}, {newColor}</li>
    );
  }
});

module.exports = PendingTransaction;
