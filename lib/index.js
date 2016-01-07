'use strict'

const kamikaze = require('kamikaze')

function CallbackStore(opts) {
  opts = opts || {}
  this._ttl = opts.ttl || Infinity
  this._callbacks = {}
}

CallbackStore.prototype.add = function(cb) {
  if (typeof cb !== 'function') {
    throw new Error('Invalid argument passed to CallbackStore.add. ' +
      'Function expected but got `' + typeof cb + '`.')
  }

  let cid = Math.random()
  let _this = this

  this._callbacks[cid] = kamikaze(this._ttl, function() {
    delete _this._callbacks[cid]
    cb.apply(this, arguments)
  }, this._ttl)

  return cid
}

CallbackStore.prototype.get = function(cid) {
  let cb = this._callbacks[cid]
  delete this._callbacks[cid]
  return cb
}

CallbackStore.prototype.releaseAll = function() {
  let err = new Error('Request callback was released.')
  for (let cid in this._callbacks) {
    this._callbacks[cid].call(null, err)
  }
}

module.exports = CallbackStore
