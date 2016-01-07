'use strict'

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect
const CallbackStore = require('../lib')

chai.use(sinonChai)

function noop() {}

describe('CallbackStore', function() {
  it('add throws error if not function passed', function() {
    let callbackStore = new CallbackStore()
    expect(() => callbackStore.add(14))
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

  describe('ttl', function() {
    beforeEach(function() {
      this.clock = sinon.useFakeTimers()
    })

    afterEach(function() {
      this.clock.restore()
    })

    it('should release callback after timeout', function() {
      let callbackStore = new CallbackStore({
        ttl: 10,
      })

      let spy = sinon.spy()
      let cid = callbackStore.add(spy)

      this.clock.tick(20)

      expect(callbackStore.get(cid)).to.be.undefined
      expect(spy).to.have.been.calledOnce
      expect(spy.getCall(0).args[0].message)
        .to.be.eq('Method execution exceeded the time limit of `10`')
    })
  })

  describe('release', function() {
    it('should release all waiting callbacks', function() {
      let spy1 = sinon.spy()
      let spy2 = sinon.spy()
      let callbackStore = new CallbackStore()
      let cid1 = callbackStore.add(spy1)
      let cid2 = callbackStore.add(spy2)
      callbackStore.releaseAll()

      expect(spy1).to.have.been.calledOnce
      expect(spy1.getCall(0).args[0].message)
        .to.be.eq('Request callback was released.')
      expect(callbackStore.get(cid1)).to.be.undefined

      expect(spy2).to.have.been.calledOnce
      expect(spy2.getCall(0).args[0].message)
        .to.be.eq('Request callback was released.')
      expect(callbackStore.get(cid2)).to.be.undefined
    })
  })
})
