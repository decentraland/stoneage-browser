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
        <div className="row change">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={this.click}
          >Set Target</button>
        </div>
      </div>
    );
  }
});

module.exports = UnminedPixel;
