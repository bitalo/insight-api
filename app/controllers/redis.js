'use strict';

// server-side socket behaviour
// io is a variable already taken in express
var redis     = require('redis');
var util      = require('bitcore').util;
var pub       = redis.createClient();
var sub       = redis.createClient();
var broadcast = require('./broadcast');

module.exports.broadcastTx = function(tx) {
  pub.publish('tx', JSON.stringify(broadcast.broadcastTx(tx)));
};

module.exports.broadcastBlock = function(block) {
  pub.publish('block', block);
};

module.exports.broadcastAddressTx = function(addr, tx) {
	pub.publish(addr, tx);
};

module.exports.broadcastSyncInfo = function(historicSync) {
  pub.publish('status', JSON.stringify(historicSync));

};
