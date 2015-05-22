'use strict';

var React = require('react');

var Pos = require('../position');
var PendingTransaction = require('./pendingTransaction');

var PendingTransactions = React.createClass({
  render: function() {
    var transactions = this.props.txPool.map(function(tx) {
      var key = 'pending_' + tx.id;
      return <PendingTransaction key={key} tx={tx} />;
    });
    return (
      <div>
        <h3>Pending Transactions</h3>
        <ul>{transactions}</ul>
      </div>
    );
  }
});

module.exports = PendingTransactions;
