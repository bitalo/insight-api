'use strict';

/**
 * Module dependencies.
 */
var Address       = require('../models/Address');
var async         = require('async');
var common        = require('./common');
var bitcore       = require('bitcore');
var Builder       = bitcore.TransactionBuilder;
var Rpc           = require('../../lib/Rpc');
var config        = require('../../config/config');


var tDb = require('../../lib/TransactionDb').default();
var bdb = require('../../lib/BlockDb').default();

exports.send = function(req, res) {
  Rpc.sendRawTransaction(req.body.rawtx, function(err, txid) {
    if (err) return common.handleErrors(err, res);
    res.json({'txid' : txid});
  });
};

exports.create = function(req, res) {

	var addrStr      = req.body.address;
	var inputTxs     = req.body.input;
	var outputAddrs  = req.body.output;

	if(addrStr) {

		var a = new Address(addrStr);

		a.getUtxo(function(err, utxos) {
			if (err) {
				console.log(err);
				return res.status(500).send('Internal Server Error');
			}

			var tb = new Builder({network: config.network});

			tb.setUnspent(utxos);
			tb.setOutputs(outputAddrs);
			tb.build();


			res.jsonp(tb.toObj());
		});

	} else if(inputTxs) {
		//@TODO: implement input tx parameter
	}
}


/**
 * Find transaction by hash ...
 */
exports.transaction = function(req, res, next, txid) {

  tDb.fromIdWithInfo(txid, function(err, tx) {
    if (err || ! tx)
      return common.handleErrors(err, res);
    else {
      req.transaction = tx.info;
      return next();
    }
  });
};


/**
 * Show transaction
 */
exports.show = function(req, res) {

  if (req.transaction) {
    res.jsonp(req.transaction);
  }
};


var getTransaction = function(txid, cb) {

  tDb.fromIdWithInfo(txid, function(err, tx) {
    if (err) console.log(err);

    if (!tx || !tx.info) {
      console.log('[transactions.js.48]:: TXid %s not found in RPC. CHECK THIS.', txid);
      return ({ txid: txid });
    }

    return cb(null, tx.info);
  });
};


/**
 * List of transaction
 */
exports.list = function(req, res, next) {
  var bId = req.query.block;
  var addrStr = req.query.address;
  var page = req.query.pageNum;
  var pageLength = 10;
  var pagesTotal = 1;
  var txLength;
  var txs;

  if (bId) {
    bdb.fromHashWithInfo(bId, function(err, block) {
      if (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
      }

      if (! block) {
        return res.status(404).send('Not found');
      }

      txLength = block.info.tx.length;

      if (page) {
        var spliceInit = page * pageLength;
        txs = block.info.tx.splice(spliceInit, pageLength);
        pagesTotal = Math.ceil(txLength / pageLength);
      }
      else {
        txs = block.info.tx;
      }

      async.mapSeries(txs, getTransaction, function(err, results) {
        if (err) {
          console.log(err);
          res.status(404).send('TX not found');
        }

        res.jsonp({
          pagesTotal: pagesTotal,
          txs: results
        });
      });
    });
  }
  else if (addrStr) {
    var a = new Address(addrStr);

    a.update(function(err) {
      if (err && !a.totalReceivedSat) {
        console.log(err);
        res.status(404).send('Invalid address');
        return next();
      }

      txLength = a.transactions.length;

      if (page) {
        var spliceInit = page * pageLength;
        txs = a.transactions.splice(spliceInit, pageLength);
        pagesTotal = Math.ceil(txLength / pageLength);
      }
      else {
        txs = a.transactions;
      }

      async.mapSeries(txs, getTransaction, function(err, results) {
        if (err) {
          console.log(err);
          res.status(404).send('TX not found');
        }

        res.jsonp({
          pagesTotal: pagesTotal,
          txs: results
        });
      });
    });
  }
  else {
    res.jsonp({
      txs: []
    });
  }
};
