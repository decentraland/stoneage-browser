
var Transaction = require('decentraland-core').Transaction;

function TransactionStore() {
}

TransactionStore.prototype.get = function(hash) {
  var data = localStorage.getItem('tx_' + hash);
  if (!data) return;
  return new Transaction(data);
};

TransactionStore.prototype.set = function(tx) {
  localStorage.setItem('tx_' + tx.hash, tx.toString());
};

module.exports = new TransactionStore();
