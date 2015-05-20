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
var posToHumanString = function(pos) {
  return pos.x + ', ' + pos.y;
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

var Pixel = React.createClass({
  render: function() {
    var pixel = this.props.pixel;
    var posStr = posToString(pixel.pos);
    var posHuman = posToHumanString(pixel.pos);
    var left = tilePositionLeft(pixel.pos.x);
    var top = tilePositionTop(pixel.pos.y);
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

var Unmined = React.createClass({
  render: function() {
    var posStr = posToString(this.props.pos);
    var left = tilePositionLeft(this.props.pos.x);
    var top = tilePositionTop(this.props.pos.y);
    var posHuman = posToHumanString(this.props.pos);
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
    var pixels = [];
    this.props.pixels.forEach(function(pixel) {
      pixels.push(
        <Pixel pixel={pixel} />
      );
      used[posToString(pixel.pos)] = true;
      neighbors(pixel.pos).forEach(function(neighbor) {
        unmined.push(neighbor);
      });
    });
    unmined.forEach(function(pos) {
      if (!used[posToString(pos)]) {
        pixels.push(
          <Unmined pos={pos} />
        );
      }
    });

    return (
      <div id="canvas">
        {pixels}
      </div>
    );
  }
});

var Mining = React.createClass({
  render: function() {
    return (
      <div>
        <h2>Status</h2>
        <ul>
          <li><strong>Mining Target</strong>: {this.props.mining.targetPos}</li>
          <li><strong>Current Difficulty</strong>: {this.props.mining.difficulty}</li>
          <li><strong>Public Key</strong>: {this.props.mining.publicKey}</li>
          <li><strong>Target Color</strong>: {this.props.mining.color}</li>
        </ul>
      </div>
    );
  }
});

var ControlledParcel = React.createClass({
  render: function() {
    var pos = posToHumanString(this.props.pixel.pos);
    var color = '#' + this.props.pixel.color;
    return (
      <li><strong>{pos}</strong>: <input type="color" value={color} /><button type="button" className="btn btn-primary btn-sm">Change</button></li>
    );
  }
});

var Controlled = React.createClass({
  render: function() {
    var parcels = [];
    this.props.controlled.forEach(function(pixel) {
      parcels.push(<ControlledParcel pixel={pixel} />);
    });
    return (
      <div>
        <h3>Controlled Parcels</h3>
        <ul>{parcels}</ul>
      </div>
    );
  }
});

var PendingTransaction = React.createClass({
  render: function() {
    var pos = posToHumanString(this.props.tx.pos);
    var newPublic = this.props.tx.publicKey;
    var newColor = this.props.tx.color;
    return (
      <li><strong>{pos}</strong>: {newPublic}, {newColor}</li>
    );
  }
});


var PendingTransactions = React.createClass({
  render: function() {
    var transactions = this.props.txPool.map(function(tx) {
      return <PendingTransaction tx={tx} />;
    });
    return (
      <div>
        <h3>Pending Transactions</h3>
        <ul>{transactions}</ul>
      </div>
    );
  }
});

var LatestBlock = React.createClass({
  render: function() {
    var id = this.props.block.id;
    var height = this.props.block.height;
    return (
      <li>{id} (height {height})</li>
    );
  }
});

var LatestBlocks = React.createClass({
  render: function() {
    var blocks = this.props.blocks.map(function(block) {
      return <LatestBlock block={block} />
    });
    return (
      <div>
        <h3>Latest Blocks</h3>
        <ul>{blocks}</ul>
      </div>
    );
  }
});

var Sidebar = React.createClass({
  render: function() {
    return (
      <div id="sidebar">
        <Mining mining={this.props.client.mining} />
        <Controlled controlled={this.props.client.controlled} />
        <PendingTransactions txPool={this.props.client.txPool} />
        <LatestBlocks blocks={this.props.client.latestBlocks} />
      </div>
    );
  }
});

var Page = React.createClass({
  render: function() {
    console.log(this.props.client);
    return (
      <div id="content">
        <Canvas pixels={this.props.client.pixels}/>
        <Sidebar client={this.props.client}/>
      </div>
    )
  }
});

var pixels = [{
  pos: { x: 0, y: 0 },
  lastTx: {
    color: 'FF0000',
    owner: 'Nobody',
    timestamp: '1432150452'
  }
}, {
  pos: { x: 1, y: 0},
  lastTx: {
    color: '00FF00',
    owner: '03000...000',
    timestamp: '1432150452'
  }
}, {
  pos: { x: 1, y: 1},
  lastTx: {
    color: '00FF00',
    owner: '03000...000',
    timestamp: '1432150452'
  }
}, {
  pos: { x: 1, y: -1},
  lastTx: {
    color: '00FF00',
    owner: '03000...000',
    timestamp: '1432150452'
  }
}, {
  pos: { x: -1, y: 0},
  lastTx: {
    color: '0000FF',
    owner: '03ABC...789',
    timestamp: '1432150452'
  }
}];

var clientData = {
  mining: {
    targetPos: { x: 2, y: 0 },
    difficulty: 4,
    publicKey: '03000...000',
    color: 'FF00FF'
  },
  controlled: [
    {
      pos: { x: 0, y: 1 },
      color: '00FF00'
    }
  ],
  txPool: [
    {
      pos: { x: 1, y: 1 },
      publicKey: '03AAA...BBB',
      color: '00FF00'
    }
  ],
  latestBlocks: [
    {
      id: '00AAAAAA',
      height: 4
    },
    {
      id: '00BBBBBB',
      height: 3
    },
    {
      id: '00CCCCCC',
      height: 2
    },
    {
      id: '00DDDDDD',
      height: 1
    },
    {
      id: '00000000',
      height: 0
    }
  ],
  pixels: pixels
};

React.render(<Page client={clientData} />, document.getElementById('content'));
