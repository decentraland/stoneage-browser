'use strict';

var React = require('react');
var PageConstructor = require('./components/page');

var client = require('./client');

var page = PageConstructor(client);

React.render(page, document.getElementById('content'));
