'use strict';

var React = require('react');

var core = require('decentraland-core');

var Mining = require('./mining');
var Controlled = require('./controlled');
var PendingTransactions = require('./pendingTransactions');
var LatestBlocks = require('./latestBlocks');
var MinedPixel = require('./minedPixel');
var UnminedPixel = require('./unminedPixel');

var Toggle = require('react-toggle');

var client = require('../../client');
var content = $('#content');

var Sidebar = React.createClass({
  getInitialState: function() {
    return {
      draw: false,
      color: 0xFF0000
    }
  },
  switchDraw: function() {
    content.toggleClass('drawmode');
    this.setState({ draw: !this.state.draw });
  },
  changeColor: function(event) {
    var color = parseInt(event.nativeEvent.target.value.substr(1, 6), 16);
    this.setState({ color: color });
  },
  render: function() {
    // <LatestBlocks blocks={this.props.client.latestBlocks} />
    var focusPixel = this.props.client.focusPixel ?
      this.props.client.focusPixel.lastTx ?
          <MinedPixel client={this.props.client} pixel={this.props.client.focusPixel} />
        : <UnminedPixel client={this.props.client} pixel={this.props.client.focusPixel} />
      : '';
    var peers = core.deps._.size(client.networking.peers);
    var pendingCount = core.deps._.size(client.txPool);
    var color = this.state.color.toString(16);
    while (color.length < 6) {
      color = '0' + color;
    }
    color = '#' + color;

    return (
      <div className="left-sidebar container">
        <div className="sidebar-title sidebar">
          <h3>Decentraland</h3>
        </div>
        <div className="status-bar sidebar">
          <Mining />
          <div className="row">
            <div className="col-md-6 leftcol">
              Pixels you control
            </div>
            <div className="col-md-6">
              20
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 leftcol">
              Connected to
            </div>
            <div className="col-md-6">
              {peers} users
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 leftcol">
              Pending transactions
            </div>
            <div className="col-md-6">
              {pendingCount}
            </div>
          </div>
        </div>
        <div className="sidebar drawbar">
          <div className="row">
            <div className="col-md-6 leftcol">
              Enable Draw Mode
            </div>
            <div className="col-md-6">
              <Toggle
                defaultChecked={false}
                onChange={this.switchDraw}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 leftcol">
              Pencil Color
            </div>
            <div className="col-md-6">
              <input type="color" value={color} onChange={this.changeColor}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Sidebar;
