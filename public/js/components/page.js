var React = require('react');
var Canvas = require('./canvas/canvas');
var Sidebar = require('./sidebar/sidebar');

function PageConstructor(client) {

  var Page = React.createClass({
    getInitialState: function() {
      return client.getState();
    },
    render: function() {
      return (
        <div id="content">
          <Canvas pixels={this.state.pixels} />
          <Sidebar client={this.state} />
        </div>
      )
    }
  });
  return <Page />;
}

module.exports = PageConstructor;
