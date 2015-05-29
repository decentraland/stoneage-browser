'use strict';

var core = require('decentraland-core');
var $ = core.util.preconditions;
var _ = core.deps._;
var util = require('util');
var EventEmitter = require('events').EventEmitter;


function Networking(opts) {
  $.checkArgument(_.isObject(opts));

  this.seeds = opts.seeds;
  this.metadata = opts.metadata;
  this.id = opts.id;
  this.server = new Peer(opts.id, opts.server);
  this.peers = {};

  this._setupServerConnection();
}

util.inherits(Networking, EventEmitter);


Networking.prototype._setupServerConnection = function() {

  var self = this;

  this.server.on('connection', function(dataConnection) {
    self._setupPeerConnection(dataConnection);
  });

  this.server.on('open', function(id) {
    // called when connection to server is ready
    console.log('Server connection established as', id);
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
    self.server.reconnect();
  });

  this.server.on('error', function(err) {
    console.log('Server connection error', err);
    // mostly fatal errors
    switch (err.type) {
      case 'browser-incompatible':
        // ERROR FATAL
        //The client's browser does not support some or all WebRTC
        //features that you are trying to use.
        break;
      case 'disconnected':
        // ERROR
        // You've already disconnected this peer from the server and can
        // no longer make any new connections on it.
        break;
      case 'invalid-id':
        // ERROR FATAL
        // The ID passed into the Peer constructor contains illegal characters.
        break;
      case 'invalid-key':
        // ERROR FATAL
        // The API key passed into the Peer constructor contains illegal
        // characters or is not in the system (cloud server only).
        break;
      case 'network':
        // ERROR
        // Lost or cannot establish a connection to the signalling server.
        break;
      case 'peer-unavailable':
        // ERROR
        // The peer you're trying to connect to does not exist.
        break;
      case 'ssl-unavailable':
        // ERROR FATAL
        // PeerJS is being used securely, but the cloud server does
        // not support SSL. Use a custom PeerServer.
        break;
      case 'server-error':
        // ERROR FATAL
        //Unable to reach the server.
        break;
      case 'socket-error':
        // ERROR FATAL
        // An error from the underlying socket.
        break;
      case 'socket-closed':
        // ERROR FATAL
        // The underlying socket closed unexpectedly.
        break;
      case 'unavailable-id':
        // ERROR SOMETIMES FATAL
        // The ID passed into the Peer constructor is already taken.
        // This error is not fatal if your peer has open peer-to-peer connections.
        // This can happen if you attempt to reconnect a peer that has been
        // disconnected from the server, but its old ID has now been taken.
        break;
      case 'webrtc':
        // ERROR
        // Native WebRTC errors.
        break;
    }

  });

};

Networking.prototype.start = function() {
  var self = this;

  _.each(this.seeds, function(seed) {
    if (seed === self.server.id) {
      return;
    }
    console.log('self.server.id', self.server.id);
    console.log('attempting to connect to', seed);
    var dataConnection = self.server.connect(seed, {
      label: undefined, // will be generated at random
      metadata: self.metadata, // other peer will receive this data on connection
      serialization: 'binary', // can be binary, binary-utf8, json, or none
      reliable: false, // true makes connection reliable, with lower performance
    });
    self._setupPeerConnection(dataConnection);
  });

};

Networking.prototype._setupPeerConnection = function(dataConnection) {
  $.checkArgument(!_.isUndefined(dataConnection), 'dataConnection is required');

  var self = this;
  var dc = dataConnection;
  var peerID = dc.peer;

  $.checkState(!this.peers[peerID], 'Tried to setup connection to ' + peerID + ' twice.');

  console.log('Setting up Peer connection with metadata', dc.metadata);

  this.peers[peerID] = dc;

  dc.on('data', function(data) {
    var type = data.type;
    var payload = data.payload;
    if (!_.isString(type)) {
      console.log('Malformed data type', data.type);
      return;
    }
    self.emit(type, peerID, payload);
  });

  dc.on('open', function() {
    // data connection is now open
    self.emit('connection', peerID);
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

Networking.prototype._cleanupPeerConnection = function(dataConnection) {
  $.checkArgument(!_.isUndefined(dataConnection), 'dataConnection is required');

  var dc = dataConnection;
  var peerID = dc.peer;

  $.checkState(this.peers[peerID], 'Attempted to cleanup non-existent connection to ' + peerID);
  delete this.peers[peerID];

};


// Sending messages

Networking.prototype.send = function(peerID, type, message) {
  $.checkArgument(this.peers[peerID], 'Not connected to peer ' + peerID);
  $.checkArgument(_.isString(type), 'type is a required string');
  $.checkArgument(!_.isUndefined(message), 'message is required');

  console.log('sending', type, 'to', peerID);
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
