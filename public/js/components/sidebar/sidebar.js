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

var cummulativeZoom = 1;
var offsetX = 0;
var offsetY = 0;
var canvas;

var zoom = function(factor) {
  var win = $(window);
  var originalWidth = win.width();
  var originalHeight = win.height();
  var targetWidth = originalWidth * factor;
  var targetHeight = originalHeight * factor;

  var extraX = (targetWidth - originalWidth) / 2;
  var extraY = (targetHeight - originalHeight) / 2;

  cummulativeZoom *= factor;
  offsetX -= extraX;
  offsetY -= extraY;

  updateView();
};
var updateView = function() {
  canvas.css({transform: 'scale(' + cummulativeZoom + ') ' + 
                         'translate(' + offsetX +'px, ' + offsetY + 'px)'});
};
var updatePanTemp = function(dx, dy) {
  canvas.css({transform: 'scale(' + cummulativeZoom + ') ' + 
                         'translate(' + (offsetX + dx / cummulativeZoom) +'px, '
                                      + (offsetY + dy / cummulativeZoom) + 'px)'});
};
var updatePan = function(dx, dy) {
  offsetX += dx / cummulativeZoom;
  offsetY += dy / cummulativeZoom;

  updateView();
};

var Sidebar = React.createClass({
  getInitialState: function() {
    return {
      draw: client.draw,
      color: client.drawColor
    }
  },
  switchDraw: function() {
    content.toggleClass('drawmode');
    client.setDraw(!this.state.draw);
    this.setState({ draw: !this.state.draw });
  },
  changeColor: function(event) {
    var color = parseInt(event.nativeEvent.target.value.substr(1, 6), 16);
    client.setDrawColor(color);
    this.setState({ color: color });
  },
  zoomIn: function() {
    zoom(1.25);
  },
  zoomOut: function() {
    zoom(0.75);
  },
  componentDidMount: function() {
    var node = React.findDOMNode(this);
    var isDragging = false;
    var firstPosition;
    var win = $(window);

    canvas = $('#canvas');
    win
      .mousedown(function(ev) {
        firstPosition = ev;
        $(window).mousemove(function(newEv) {
          updatePanTemp(newEv.clientX - ev.clientX, newEv.clientY - ev.clientY);
          isDragging = true;
        });
      })
      .mouseup(function(newEv) {
        var wasDragging = isDragging;
        isDragging = false;
        $(window).unbind("mousemove");
        if (wasDragging) {
          updatePan(newEv.clientX - firstPosition.clientX, newEv.clientY - firstPosition.clientY);
        }
      });

    client.on('update', function() {
      // Show tip for last block
      // Show tip for mining target
    });
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
        <div className="sidebar-title sidebar row">
          <div className="col-md-6">
            <h3>Decentraland</h3>
          </div>
          <div className="col-md-6 btn-group" role="group">
            <a onClick={this.zoomIn} className="btn">
              <span className="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
            </a>
            <a onClick={this.zoomOut} className="btn">
              <span className="glyphicon glyphicon-zoom-out" aria-hidden="true"></span>
            </a>
          </div>
        </div>
        <div className="status-bar sidebar">
          <Mining />
          <div className="row">
            <div className="col-md-6 leftcol">
              Pixels you control
            </div>
            <div className="col-md-6">
              {this.props.client.controlled.length}
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
              Total pixel count
            </div>
            <div className="col-md-6">
              {this.props.client.height}
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
