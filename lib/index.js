'use strict';

function CallbackStore(options) {
  options = options || {};
  
  this._ttl = options.ttl || 5 * 1000;
  
  this._requests = {};
}

CallbackStore.prototype.add = function (cb) {
  if (typeof cb !== 'function') {
    throw new Error('Invalid argument passed to CallbackStore.add. Function expected but got `' + typeof cb + '`.');
  }
  
  var correlationId = Math.random();
  
  var timeoutId = setTimeout(function () {
    var cb = this.get(correlationId);
    cb(new Error('Response timed out.'));
  }.bind(this), this._ttl);
  
  this._requests[correlationId] = {
    timeoutId: timeoutId,
    cb: cb
  };
  
  return correlationId;
};

CallbackStore.prototype.get = function (correlationId) {
  if (this._requests[correlationId]) {
    clearTimeout(this._requests[correlationId].timeoutId);
    var cb = this._requests[correlationId].cb;
    delete this._requests[correlationId];
    return cb;
  }
  return null;
};

CallbackStore.prototype.releaseAll = function () {
  for (var correlationId in this._requests) {
    var cb = this.get(correlationId);
    cb(new Error('Request callback was released.'));
  }
};

module.exports = CallbackStore;