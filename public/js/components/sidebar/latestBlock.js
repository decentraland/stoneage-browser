'use strict';

var React = require('react');

var LatestBlock = React.createClass({
  render: function() {
    var id = this.props.block.id;
    var height = this.props.block.height;
    return (
      <li>{id} (height {height})</li>
    );
  }
});

module.exports = LatestBlock;
