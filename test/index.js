'use strict'

const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect
const CallbackStore = require('../lib')
function noop() {}

describe('CallbackStore', function() {
  it('add throws error if not function passed', function() {
    let callbackStore = new CallbackStore()
    expect(function() {
      callbackStore.add(14)
    })
    .to.throw(Error, 'Invalid argument passed to CallbackStore.add. ' +
      'Function expected but got `number`.')
  })

  it('returns correct callback', function(done) {
    let callbackStore = new CallbackStore()
    let cid = callbackStore.add(done)
    let cb = callbackStore.get(cid)
    expect(cb).to.be.a('function')
    cb()
  })

  it('returns different correlation IDs', function() {
    let callbackStore = new CallbackStore()
    let cid1 = callbackStore.add(noop)
    let cid2 = callbackStore.add(noop)
    expect(cid1).to.not.eq(cid2)
  })

  it('returns callback only once', function() {
    let callbackStore = new CallbackStore()
    let cid = callbackStore.add(noop)
    callbackStore.get(cid)
    let nothing = callbackStore.get(cid)
    expect(nothing).to.be.undefined
  })

  describe('release', function() {
    it('should release all waiting callbacks', function() {
      let spy1 = sinon.spy()
      let spy2 = sinon.spy()
      let callbackStore = new CallbackStore()
      let cid1 = callbackStore.add(spy1)
      let cid2 = callbackStore.add(spy2)
      callbackStore.releaseAll()

      expect(spy1.calledOnce).to.be.true
      expect(spy1.getCall(0).args[0].message)
        .to.be.eq('Request callback was released.')
      expect(callbackStore.get(cid1)).to.be.undefined

      expect(spy2.calledOnce).to.be.true
      expect(spy2.getCall(0).args[0].message)
        .to.be.eq('Request callback was released.')
      expect(callbackStore.get(cid2)).to.be.undefined
    })
  })

  it('exec applies the correct arguments and context', function() {
    let spy = sinon.spy()
    let callbackStore = new CallbackStore()
    let cid = callbackStore.add(spy)
    callbackStore.exec(cid, 1, [2, 3])

    expect(callbackStore.get(cid)).to.be.undefined
    expect(spy.calledOnce).to.be.true
    expect(spy.calledOn(1)).to.be.true
    expect(spy.calledWithExactly(2, 3)).to.be.true
  })
})
