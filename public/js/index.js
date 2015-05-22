'use strict';

var React = require('react');
var PageConstructor = require('./components/page');

var Client = require('./client');

var client = new Client();

React.render(PageConstructor(client), document.getElementById('content'));
