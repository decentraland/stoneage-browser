'use strict';

var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Popover = ReactBootstrap.Popover;
var client = require('../../client');

var Pos = require('../position');

var Pixel = React.createClass({
  click: function() {
    if (client.draw) {
      client.makeTransaction(this.props.pixel.position, client.drawColor);
    } else {
      client.setFocusPixel(this.props.pixel.position);
    }
  },
  render: function() {
    var pixel = this.props.pixel;
    var posStr = Pos.posToString(pixel.position);
    var posHuman = Pos.posToHumanString(pixel.position);
    var left = Pos.tilePositionLeft(pixel.position.x);
    var top = Pos.tilePositionTop(pixel.position.y);
    var id = "pixel_" + posStr;
    var color = pixel.color.toString(16).substr(0, 6);
    while (color.length < 6) {
      color = '0' + color;
    }
    color = '#' + color;
    var controlled = !!client.wallet[client.blockchain.pixels[posStr].owner.toString()] ?
      'controlled' : '';
    var classString = "pixel " + controlled;
    return (
      <a
        id={id}
        className={classString}
        style={{left: left + 'px', top: top + 'px', backgroundColor: color}}
        onClick={this.click}
        tabIndex="0"
        role="button"
      ></a>
    );
  }
});

module.exports = Pixel;
