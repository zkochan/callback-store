'use strict';
var bind = require('bind-ponyfill');

function CallbackStore(opts) {
  opts = opts || {};

  this._ttl = opts.ttl || 5 * 1000;
  this._requests = {};
}

CallbackStore.prototype.add = function(cb) {
  if (typeof cb !== 'function') {
    throw new Error('Invalid argument passed to CallbackStore.add. ' +
      'Function expected but got `' + typeof cb + '`.');
  }

  var cid = Math.random();

  this._requests[cid] = {
    timeoutId: this._delayedKill(cid),
    cb: cb
  };

  return cid;
};

CallbackStore.prototype._delayedKill = function(cid) {
  return setTimeout(bind(function() {
    var err = new Error('Response timed out.');
    this.exec(cid, {}, [err]);
  }, this), this._ttl);
};

CallbackStore.prototype.get = function(cid) {
  if (this._requests[cid]) {
    clearTimeout(this._requests[cid].timeoutId);
    var cb = this._requests[cid].cb;
    delete this._requests[cid];
    return cb;
  }
  return null;
};

CallbackStore.prototype.exec = function(cid, thisArg, args) {
  var cb = this.get(cid);

  if (!cb) {
    return;
  }

  cb.apply(thisArg, args);
};

CallbackStore.prototype.releaseAll = function() {
  for (var cid in this._requests) {
    var err = new Error('Request callback was released.');
    this.exec(cid, {}, [err]);
  }
};

module.exports = CallbackStore;
