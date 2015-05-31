'use strict';

var React = require('react');
var client = require('../../client');

var UnminedPixel = React.createClass({
  click: function() {
    client.setTarget(this.props.pixel.position);
  },
  render: function() {
    // <LatestBlocks blocks={this.props.client.latestBlocks} />
    return (
      <div id="focusPixel">
        <h3>Pixel: {this.props.pixel.position.x}, {this.props.pixel.position.y}</h3>
        <ul>
          <li>
            <button className="btn btn-success" onClick={this.click}>
              Set as target
            </button>
          </li>
        </ul>
      </div>
    );
  }
});

module.exports = UnminedPixel;
