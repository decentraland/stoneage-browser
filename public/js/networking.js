'use strict';

var core = require('decentraland-core');
var $ = core.util.preconditions;
var _ = core.deps._;
var util = require('util');
var EventEmitter = require('events').EventEmitter;


var SEED_CONNECT_INTERVAL = 25 * 1000;
var BASE_RECONNECT_INTERVAL = 1000;

function Networking(opts) {
  $.checkArgument(_.isObject(opts));

  this.seeds = opts.seeds;
  this.metadata = opts.metadata;
  this.id = opts.id;
  this.server = new Peer(opts.id, opts.server);
  this.peers = {};
  this.reconnectInterval = BASE_RECONNECT_INTERVAL;

  this._setupServerConnection();
}

util.inherits(Networking, EventEmitter);


Networking.prototype.isConnected = function() {
  return this.server && this.server.disconnected === false;
};

Networking.prototype._setupServerConnection = function() {

  var self = this;

  this.server.on('open', function(id) {
    // called when connection to server is ready
    console.log('Server connection established as', id);
    if (self.reconnectInterval !== BASE_RECONNECT_INTERVAL) {
      self.emit('reconnected');
    }
    self.reconnectInterval = BASE_RECONNECT_INTERVAL;
    self.startReconnect();
  });

  this.server.on('connection', function(dataConnection) {
    self._setupPeerConnection(dataConnection);
  });

  this.server.on('call', function(mediaConnection) {
    console.log('MediaConnection attempted, ignoring');
    // ignore non-data connections
    mediaConnection.close();
  });

  this.server.on('close', function() {
    // at this time, the peer's connections will all be closed.
    console.log('All peer connections are closed.');
  });

  this.server.on('disconnected', function() {
    // Emitted when the peer is disconnected from the signalling server
    //console.log('disconnected from signaling server, attempting to reconnect');
    self.stop();
    setTimeout(self.server.reconnect.bind(self.server), self.reconnectInterval);
    self.emit('reconnecting', self.reconnectInterval);
    self.reconnectInterval *= 2;
  });

  this.server.on('error', function(err) {
    // mostly fatal errors
    switch (err.type) {
      case 'peer-unavailable':
        // ERROR
        // The peer you're trying to connect to does not exist.
        var peerID = err.message.substring(26);
        self.emit('peer-unavailable', peerID);
        break;
      case 'unavailable-id':
        // ERROR SOMETIMES FATAL
        // The ID passed into the Peer constructor is already taken.
        // This error is not fatal if your peer has open peer-to-peer connections.
        // This can happen if you attempt to reconnect a peer that has been
        // disconnected from the server, but its old ID has now been taken.
        self.emit('unavailable-id');
        break;
      case 'network':
        // ERROR
        // Lost or cannot establish a connection to the signalling server.
        self.emit('unreachable');
        break;
      case 'browser-incompatible':
        // ERROR FATAL
        //The client's browser does not support some or all WebRTC
        //features that you are trying to use.
      case 'disconnected':
        // ERROR
        // You've already disconnected this peer from the server and can
        // no longer make any new connections on it.
      case 'invalid-id':
        // ERROR FATAL
        // The ID passed into the Peer constructor contains illegal characters.
      case 'invalid-key':
        // ERROR FATAL
        // The API key passed into the Peer constructor contains illegal
        // characters or is not in the system (cloud server only).
      case 'ssl-unavailable':
        // ERROR FATAL
        // PeerJS is being used securely, but the cloud server does
        // not support SSL. Use a custom PeerServer.
      case 'server-error':
        // ERROR FATAL
        //Unable to reach the server.
      case 'socket-error':
        // ERROR FATAL
        // An error from the underlying socket.
      case 'socket-closed':
        // ERROR FATAL
        // The underlying socket closed unexpectedly.
      case 'webrtc':
        // ERROR
        // Native WebRTC errors.
        console.log('Server connection error of type', err.type, err);
    }

  });

};

Networking.prototype.start = function() {
  console.log('My own id:', this.server.id);
  this.connectToSeeds();
};


Networking.prototype.startReconnect = function() {
  this.seedInterval = setInterval(this.connectToSeeds.bind(this), SEED_CONNECT_INTERVAL);
};

Networking.prototype.stop = function() {
  clearInterval(this.seedInterval);
};

Networking.prototype.connectToSeeds = function() {
  var self = this;
  console.log('Attempting connection to seeds');
  _.each(this.seeds, function(seed) {
    if (seed === self.server.id) {
      return;
    }
    self.openConnection(seed);
  });
};

Networking.prototype._setupPeerConnection = function(dataConnection) {
  $.checkArgument(!_.isUndefined(dataConnection), 'dataConnection is required');

  var self = this;
  var dc = dataConnection;
  var peerID = dc.peer;

  $.checkState(!this.peers[peerID], 'Tried to setup connection to ' + peerID + ' twice.');

  dc.on('data', function(data) {
    var type = data.type;
    var payload = data.payload;
    if (!_.isString(type)) {
      console.log('Malformed data type', data.type);
      return;
    }
    self.emit(type, peerID, payload);
  });

  if (dc.open) {
    self._addPeer(dc);
  }
  dc.on('open', function() {
    // data connection is now open
    self._addPeer(dc);
  });

  dc.on('close', function() {
    console.log('Peer connection to', peerID, 'closed.');
    self._cleanupPeerConnection(dc);
  });

  dc.on('error', function(err) {
    console.log('Peer connection error', err);
    self._cleanupPeerConnection(dc);
  });
};

Networking.prototype._addPeer = function(dataConnection) {
  var dc = dataConnection;
  var peerID = dc.peer;

  this.peers[peerID] = dc;

  this.emit('connection', peerID);
};

Networking.prototype._cleanupPeerConnection = function(dataConnection) {
  $.checkArgument(!_.isUndefined(dataConnection), 'dataConnection is required');

  var dc = dataConnection;
  var peerID = dc.peer;

  $.checkState(this.peers[peerID], 'Attempted to cleanup non-existent connection to ' + peerID);
  delete this.peers[peerID];

};

Networking.prototype.closeConnection = function(peerID) {
  $.checkArgument(!_.isString(peerID), 'peerID is a required string');
  $.checkArgument(this.peers[peerID], 'Attempted to close non-existent connection to ' + peerID);
  this.peers[peerID].disconnect();
  this._cleanupPeerConnection();
};

Networking.prototype.openConnection = function(peerID) {
  if (!this.peers[peerID]) {
    console.log('Attempting to connect to', peerID);
    var dataConnection = this.server.connect(peerID, {
      label: peerID,
      metadata: this.metadata,
      serialization: 'binary',
      reliable: false
    });
    this._setupPeerConnection(dataConnection);
  }
};


// Sending messages

Networking.prototype.send = function(peerID, type, message) {
  $.checkArgument(this.peers[peerID], 'Not connected to peer ' + peerID);
  $.checkArgument(_.isString(type), 'type is a required string');
  $.checkArgument(!_.isUndefined(message), 'message is required');

  //console.log('sending', type, 'to', peerID);
  this.peers[peerID].send({
    type: type,
    payload: message
  });
};

Networking.prototype.broadcast = function(type, message) {
  $.checkArgument(_.isString(type), 'type is a required string');
  $.checkArgument(!_.isUndefined(message), 'message is required');

  _.each(this.peers, function(connection) {
    connection.send({
      type: type,
      payload: message
    });
  });
};


// query state
Networking.prototype.getConnectedPeers = function() {
  return _.keys(this.peers).length;
};


module.exports = Networking;
