'use strict';

var React = require('react');

var LatestBlock = require('./latestBlock');

var LatestBlocks = React.createClass({
  render: function() {
    var blocks = this.props.blocks.map(function(block) {
      var key = 'latest_' + block.hash;
      return <LatestBlock key={key} block={block} />
    });
    return (
      <div>
        <h3>Latest Blocks</h3>
        <ul>{blocks}</ul>
      </div>
    );
  }
});

module.exports = LatestBlocks;
