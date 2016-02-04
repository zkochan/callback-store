'use strict'
const kamikaze = require('kamikaze')

module.exports = callbackStore

function callbackStore(opts) {
  let callbacks = {}

  return {
    add(id, cb, ttl) {
      if (!id)
        throw new Error('id is required')

      if (typeof cb !== 'function')
        throw new Error('cb is required.')

      if (typeof ttl !== 'number')
        throw new Error('ttl is required')

      if (callbacks[id])
        throw new Error('There\' already a callback saved with the passed id')

      callbacks[id] = kamikaze(ttl, function() {
        delete callbacks[id]
        cb.apply(this, arguments)
      })
    },
    get(cid) {
      let cb = callbacks[cid]
      if (cb) clearTimeout(cb.timeoutId)
      delete callbacks[cid]
      return cb
    },
  }
}
