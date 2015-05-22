var Mining = require('./mining');

var miner = new Mining({
  nonce: 0,
  difficulty: 2,
  publicKey: 'PUBPUB',
  color: '00FF00AA',
  prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
  height: 0,
  txPool: [
    {
      toBuffer: function() {
        return new Buffer('0000000000');
      }
    }
  ]
});

// var last = 0;
// var interval = setInterval(1000, function() {
//  var times = miner.nonce - last;
//  console.log('Hashrate: ' + times + ' H/s');
//  last = miner.nonce;
// });

miner.startMining(function(block, hash) {
  console.log('mined:', hash.toString('hex'), block);
//  clearInterval(interval);
});
