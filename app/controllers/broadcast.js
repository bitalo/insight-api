'use strict';

var util = require('bitcore').util;

var broadcaster = ['redis', 'socket'];

module.exports.broadcastTx = function(tx) {
	var t;
	if (typeof tx === 'string') {
		t = {
			txid: tx
		};
	}

	else {
		t = {
			txid: tx.txid,
			size: tx.size
		};
		// Outputs
		var valueOut = 0;
		tx.vout.forEach(function(o) {
			valueOut += o.value * util.COIN;
		});

		t.valueOut = parseInt(valueOut) / util.COIN;
	}

	return t;
};