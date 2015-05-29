'use strict';

var React = require('react');

var Mining = require('./mining');
var Controlled = require('./controlled');
var PendingTransactions = require('./pendingTransactions');
var LatestBlocks = require('./latestBlocks');

var Sidebar = React.createClass({
  render: function() {
    // <LatestBlocks blocks={this.props.client.latestBlocks} />
    return (
      <div id="sidebar">
        <Mining mining={this.props.client.mining} />
        <Controlled
            controlled={this.props.client.controlled}
            client={this.props.client} />
        <PendingTransactions txPool={this.props.client.txPool} />
      </div>
    );
  }
});

module.exports = Sidebar;
