'use strict'

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect
const CallbackStore = require('../lib')

chai.use(sinonChai)

function noop() {}

describe('CallbackStore', function() {
  it('should throw error if no callback passed', function() {
    let callbackStore = new CallbackStore()
    expect(() => callbackStore.add(1, 14)).to.throw(Error)
  })

  it('should throw error if no id passed', function() {
    let callbackStore = new CallbackStore()
    expect(() => callbackStore.add()).to.throw(Error)
  })

  it('should throw error if no ttl passed', function() {
    let callbackStore = new CallbackStore()
    expect(() => callbackStore.add(1, function() {})).to.throw(Error)
  })

  it('should throw error if not unique id', function() {
    let callbackStore = new CallbackStore()
    callbackStore.add(1, noop, 1e3)
    expect(() => callbackStore.add(1, noop, 1e3)).to.throw(Error)
  })

  it('should return correct callback', function(done) {
    let callbackStore = new CallbackStore()
    let cid = 'foo'
    callbackStore.add(cid, done, 1e3)
    let cb = callbackStore.get(cid)
    expect(cb).to.be.a('function')
    cb()
  })

  it('should return callback only once', function() {
    let callbackStore = new CallbackStore()
    let cid = 'foo'
    callbackStore.add(cid, noop, 1e3)
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
      let callbackStore = new CallbackStore()

      let spy = sinon.spy()
      let cid = 'foo'
      callbackStore.add(cid, spy, 10)

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
      let cid1 = '1'
      callbackStore.add(cid1, spy1, 1e3)
      let cid2 = '2'
      callbackStore.add(cid2, spy2, 1e3)
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
