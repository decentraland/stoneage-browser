var iceServers = require('./ice');

module.exports = {
  tileWidth: 10,
  tileHeight: 10,
  tileSeparation: 1,

  networking: {
    id: null,
    server: {
      //debug: 3,
      host: 'localhost',
      port: 9000,
      key: 'igd9tuakix0w9udi',
      iceServers: iceServers,

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
