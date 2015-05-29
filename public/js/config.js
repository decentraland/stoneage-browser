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
      host: 'localhost',
      port: 9000,
      key: 'igd9tuakix0w9udi',
    },
    seeds: [
      'seed-livenet-maraoz',
      'seed-livenet-eordano',
    ],
  },
};
