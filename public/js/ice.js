'use strict';

var freeice = require('freeice');
var core = require('decentraland-core');
var _ = core.deps._;

var ice = [{
  url: 'stun:stun.l.google.com:19302'
}, {
  url: 'stun:stun1.l.google.com:19302'
}, {
  url: 'stun:stun2.l.google.com:19302'
}, {
  url: 'stun:stun3.l.google.com:19302'
}, {
  url: 'stun:stun4.l.google.com:19302'
}, {
  url: 'stun:stun01.sipphone.com'
}, {
  url: 'stun:stun.ekiga.net'
}, {
  url: 'stun:stun.fwdnet.net'
}, {
  url: 'stun:stun.ideasip.com'
}, {
  url: 'stun:stun.iptel.org'
}, {
  url: 'stun:stun.rixtelecom.se'
}, {
  url: 'stun:stun.schlund.de'
}, {
  url: 'stun:stunserver.org'
}, {
  url: 'stun:stun.softjoys.com'
}, {
  url: 'stun:stun.voiparound.com'
}, {
  url: 'stun:stun.voipbuster.com'
}, {
  url: 'stun:stun.voipstunt.com'
}, {
  url: 'stun:stun.voxgratia.org'
}, {
  url: 'stun:stun.xten.com'
}, ];

_.extend(ice, freeice());

module.exports = ice;
