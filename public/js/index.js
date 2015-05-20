var Decentraland = window.Decentraland;
var config = Decentraland.config;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Popover = ReactBootstrap.Popover;

var neighbors = function(pos) {
  return [
    {x: pos.x -1, y: pos.y},
    {x: pos.x +1, y: pos.y},
    {x: pos.x, y: pos.y - 1},
    {x: pos.x, y: pos.y + 1}
  ];
};
var posToString = function(pos) {
  return pos.x + '_' + pos.y;
};

var width = $(document).width();
var height = $(document).height();

var tilePositionTop = function(y) {
  return (height - config.tileHeight) / 2
    - y * config.tileHeight
    - y * config.tileSeparation;
};
var tilePositionLeft = function(x) {
  return (width - config.tileWidth) / 2
    + x * config.tileHeight
    + x * config.tileSeparation;
};

var Block = React.createClass({
  render: function() {
    var block = this.props.block;
    var posStr = posToString(block.pos);
    var left = tilePositionLeft(block.pos.x);
    var top = tilePositionTop(block.pos.y);
    var id = "block_" + posStr;
    return (
      <OverlayTrigger trigger='focus' placement='top' overlay={
        <Popover html="true">
          <h3>({posStr})</h3>
          <ul>
            <li>Owner: {block.owner}</li>
            <li>Color: {block.color}</li>
            <li>Last change: {block.timestamp}</li>
          </ul>
        </Popover>}>
        <a
          id={id}
          className="block"
          style={{left: left + 'px', top: top + 'px', backgroundColor: block.color}}
          tabIndex="0"
          role="button"
        ></a>
      </OverlayTrigger>
    );
  }
});

var Unmined = React.createClass({
  render: function() {
    var posStr = posToString(this.props.pos);
    var left = tilePositionLeft(this.props.pos.x);
    var top = tilePositionTop(this.props.pos.y);
    var id = 'block_' + posStr;
    return (
      <OverlayTrigger trigger='focus' placement='top' overlay={
        <Popover html="true"><h3>({posStr})</h3>
          <ul>
          <li>Not mined</li>
          <li><a className='btn btn-primary btn-sm'>Set as target</a></li>
          </ul>
        </Popover>}>
        <a
          id={id}
          className="block unmined"
          style={{left: left + 'px', top: top + 'px'}}
          tabIndex="0"
          role="button"
        ></a>
      </OverlayTrigger>
    );
  }
});

var Canvas = React.createClass({
  render: function() {
    var used = {};
    var unmined = [];
    var blocks = [];
    this.props.blocks.forEach(function(block) {
      blocks.push(
        <Block block={block} />
      );
      used[posToString(block.pos)] = true;
      neighbors(block.pos).forEach(function(neighbor) {
        unmined.push(neighbor);
      });
    });
    unmined.forEach(function(pos) {
      if (!used[posToString(pos)]) {
        blocks.push(
          <Unmined pos={pos} />
        );
      }
    });

    return (
      <div id="canvas">
        {blocks}
      </div>
    );
  }
});

var blocks = [{
  pos: { x: 0, y: 0 },
  color: '#FF0000',
  owner: 'Nobody',
  timestamp: '1432150452'
}, {
  pos: { x: 1, y: 0},
  color: '#00FF00',
  owner: '03000...000',
  timestamp: '1432150452'
}, {
  pos: { x: 1, y: 1},
  color: '#00FF00',
  owner: '03000...000',
  timestamp: '1432150452'
}, {
  pos: { x: 1, y: -1},
  color: '#00FF00',
  owner: '03000...000',
  timestamp: '1432150452'
}, {
  pos: { x: -1, y: 0},
  color: '#0000FF',
  owner: '03ABC...789',
  timestamp: '1432150452'
}];

React.render(<Canvas blocks={blocks} />, document.getElementById('content'));

var Page = React.createClass({
  render: function() {
    return (
      <div id="content">
        <Canvas />
        <Sidebar />
      </div>
    )
  }
});
