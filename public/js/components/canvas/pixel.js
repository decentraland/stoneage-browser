'use strict';

var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Popover = ReactBootstrap.Popover;

var Pos = require('../position');

var Pixel = React.createClass({
  render: function() {
    var pixel = this.props.pixel;
    var posStr = Pos.posToString(pixel.pos);
    var posHuman = Pos.posToHumanString(pixel.pos);
    var left = Pos.tilePositionLeft(pixel.pos.x);
    var top = Pos.tilePositionTop(pixel.pos.y);
    var id = "pixel_" + posStr;
    var color = '#' + pixel.lastTx.color;
    return (
      <OverlayTrigger trigger='focus' placement='top' overlay={
        <Popover html="true">
          <h3>({posHuman})</h3>
          <ul>
            <li>Owner: {pixel.lastTx.owner}</li>
            <li>Color: {pixel.lastTx.color}</li>
            <li>Last change: {pixel.lastTx.timestamp}</li>
          </ul>
        </Popover>}>
        <a
          id={id}
          className="pixel"
          style={{left: left + 'px', top: top + 'px', backgroundColor: color}}
          tabIndex="0"
          role="button"
        ></a>
      </OverlayTrigger>
    );
  }
});

module.exports = Pixel;
