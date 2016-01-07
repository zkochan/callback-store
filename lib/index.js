'use strict'

const kamikaze = require('kamikaze')

function CallbackStore(opts) {
  this._callbacks = {}
}

CallbackStore.prototype.add = function(id, cb, ttl) {
  if (!id)
    throw new Error('id is required')

  if (typeof cb !== 'function')
    throw new Error('cb is required.')

  if (typeof ttl !== 'number')
    throw new Error('ttl is required')

  if (this._callbacks[id])
    throw new Error('There\' already a callback saved with the passed id')

  let _this = this

  this._callbacks[id] = kamikaze(ttl, function() {
    delete _this._callbacks[id]
    cb.apply(this, arguments)
  })
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
    delete this._callbacks[cid]
  }
}

module.exports = CallbackStore
