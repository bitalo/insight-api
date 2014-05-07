'use strict';

/**
 * Module dependencies.
 */

var Address = require('../models/Address'),
    common      = require('./common');

var getAddr = function(req, res, next) {
  var a;
  try {
    var addr = req.param('addr');
    a = new Address(addr);
  } catch (e) {
    common.handleErrors({message: 'Invalid address:' + e.message, code: 1}, res, next);
    return null;
  }
  return a;
};

exports.create = function(req, res) {
	// @TODO: add complete HD Wallet
	var keys    = req.body.keys;
	var number  = req.body.number;

	var a = Address.createMultiSig(number, keys);
	return res.jsonp(a);
};

exports.show = function(req, res, next) {
  var a = getAddr(req, res, next);
  
  if (a)
    a.update(function(err) {
      if (err) {
        return common.handleErrors(err, res);
      }
      else  {
        return res.jsonp(a);
      }
    }, req.query.noTxList);
};



exports.utxo = function(req, res, next) {
  var a = getAddr(req, res, next);
  
  if (a)
    a.getUtxo(function(err, utxo) {
      if (err)
        return common.handleErrors(err, res);
      else  {
        return res.jsonp(utxo);
      }
    });
};



exports.balance = function(req, res, next) {
  var a = getAddr(req, res, next);
  if (a)
    a.update(function(err) {
      if (err) {
        return common.handleErrors(err, res);
      }
      else  {
        return res.jsonp(a.balanceSat);
      }
    });
};

exports.totalReceived = function(req, res, next) {
  var a = getAddr(req, res, next);
  if (a)
    a.update(function(err) {
      if (err) {
        return common.handleErrors(err, res);
      }
      else  {
        return res.jsonp(a.totalReceivedSat);
      }
    });
};

exports.totalSent = function(req, res, next) {
  var a = getAddr(req, res, next);
  if (a)
    a.update(function(err) {
      if (err) {
        return common.handleErrors(err, res);
      }
      else  {
        return res.jsonp(a.totalSentSat);
      }
    });
};

exports.unconfirmedBalance = function(req, res, next) {
  var a = getAddr(req, res, next);
  if (a)
    a.update(function(err) {
      if (err) {
        return common.handleErrors(err, res);
      }
      else  {
        return res.jsonp(a.unconfirmedBalanceSat);
      }
    });
};
