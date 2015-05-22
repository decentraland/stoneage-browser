'use strict';

var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Popover = ReactBootstrap.Popover;

var Pos = require('../position.js');

var Unmined = React.createClass({
  render: function() {
    var posStr = Pos.posToString(this.props.pos);
    var left = Pos.tilePositionLeft(this.props.pos.x);
    var top = Pos.tilePositionTop(this.props.pos.y);
    var posHuman = Pos.posToHumanString(this.props.pos);
    var id = 'pixel_' + posStr;
    return (
      <OverlayTrigger trigger='focus' placement='top' overlay={
        <Popover html="true"><h3>({posHuman})</h3>
          <ul>
          <li>Not mined</li>
          <li><a className='btn btn-primary btn-sm'>Set as target</a></li>
          </ul>
        </Popover>}>
        <a
          id={id}
          className="pixel unmined"
          style={{left: left + 'px', top: top + 'px'}}
          // onClick={this.props.setTarget(pixel.pos)}
          tabIndex="0"
          role="button"
        ></a>
      </OverlayTrigger>
    );
  }
});

module.exports = Unmined;
