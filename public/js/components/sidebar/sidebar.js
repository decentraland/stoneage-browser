'use strict';

var React = require('react');

var Mining = require('./mining');
var Controlled = require('./controlled');
var PendingTransactions = require('./pendingTransactions');
var LatestBlocks = require('./latestBlocks');

var Sidebar = React.createClass({
  render: function() {
    return (
      <div id="sidebar">
        <Mining mining={this.props.client.mining} />
        <Controlled controlled={this.props.client.controlled} />
        <PendingTransactions txPool={this.props.client.txPool} />
        <LatestBlocks blocks={this.props.client.latestBlocks} />
      </div>
    );
  }
});

module.exports = Sidebar;
