var React = require('react');
var Canvas = require('./canvas/canvas');
var Sidebar = require('./sidebar/sidebar');

var Pos = require('./position');
var MinedPixel = require('./sidebar/minedPixel');
var UnminedPixel = require('./sidebar/unminedPixel');

function PageConstructor(client) {

  var Page = React.createClass({
    getInitialState: function() {
      var self = this;
      client.on('update', function() {
        self.setState(client.getState());
      })
      return client.getState();
    },
    render: function() {
      var focus = this.state.focusPixel ?
        (client.blockchain.pixels[Pos.posToString(this.state.focusPixel.position)] ?
        <MinedPixel pixel={this.state.focusPixel} /> :
        <UnminedPixel pixel={this.state.focusPixel} />) : '';
      return (
        <div id="content">
          <Canvas client={this.state} pixels={this.state.pixels} />
          <Sidebar client={this.state} />
          {focus}
        </div>
      )
    }
  });
  return <Page />;
}

module.exports = PageConstructor;
