'use strict';

var React = require('react');

var Mining = require('./mining');
var Controlled = require('./controlled');
var PendingTransactions = require('./pendingTransactions');
var LatestBlocks = require('./latestBlocks');
var MinedPixel = require('./minedPixel');
var UnminedPixel = require('./unminedPixel');

var Sidebar = React.createClass({
  render: function() {
    // <LatestBlocks blocks={this.props.client.latestBlocks} />
    var focusPixel = this.props.client.focusPixel ?
      this.props.client.focusPixel.lastTx ?
          <MinedPixel client={this.props.client} pixel={this.props.client.focusPixel} />
        : <UnminedPixel client={this.props.client} pixel={this.props.client.focusPixel} />
      : '';
    console.log(this.props.client.focusPixel);
    return (
      <div id="sidebar">
        {focusPixel}
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
