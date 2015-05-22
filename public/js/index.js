'use strict';

var React = require('react');
var PageConstructor = require('./components/page');

var Client = require('./client');

var client = new Client();

var page = PageConstructor(client);

React.render(page, document.getElementById('content'));
