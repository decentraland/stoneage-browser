module.exports = {
  server: 'localhost:3000',
  tileWidth: 10,
  tileHeight: 10,
  tileSeparation: 1,

  networking: {
    id: null,
    //id: 'seed-livenet-maraoz',
    //id: 'seed-livenet-eordano',
    server: {
      //debug: 3,
      //host: 'localhost',
      //port: 9000,
      key: 'igd9tuakix0w9udi',
      'iceServers': [{
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
      }, ]

    },
    seeds: [
      'seed-livenet-maraoz',
      'seed-livenet-eordano',
      'seed-livenet-esneider',
      'seed-livenet-marianorod',
      'seed-livenet-yemel',
      'seed-livenet-voltaire',
      'seed-livenet-paraoz',
    ],
  },
};
