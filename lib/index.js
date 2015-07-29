'use strict';
var bind = require('bind-ponyfill');

function CallbackStore() {
  this._callbacks = {};
}

CallbackStore.prototype.add = function(cb) {
  if (typeof cb !== 'function') {
    throw new Error('Invalid argument passed to CallbackStore.add. ' +
      'Function expected but got `' + typeof cb + '`.');
  }

  var cid = Math.random();

  this._callbacks[cid] = cb;

  return cid;
};

CallbackStore.prototype.get = function(cid) {
  var cb = this._callbacks[cid];
  delete this._callbacks[cid];
  return cb;
};

CallbackStore.prototype.exec = function(cid, thisArg, args) {
  var cb = this.get(cid);

  if (!cb) {
    return;
  }

  cb.apply(thisArg, args);
};

CallbackStore.prototype.releaseAll = function() {
  for (var cid in this._callbacks) {
    var err = new Error('Request callback was released.');
    this.exec(cid, {}, [err]);
  }
};

module.exports = CallbackStore;
