
var Block = require('decentraland-core').Block;
function BlockStore() {
}

BlockStore.prototype.get = function(hash) {
  var data = localStorage.getItem('block_' + hash);
  if (!data) return;
  return Block.fromString(data);
};

BlockStore.prototype.set = function(block) {
  return localStorage.setItem('block_' + block.hash, block.toString());
};

module.exports = new BlockStore();
