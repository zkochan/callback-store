'use strict'
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect
const cbStore = require('../lib')

chai.use(sinonChai)

function noop() {}

describe('callback-store', function() {
  let callbacks

  beforeEach(function() {
    callbacks = cbStore()
  })

  it('should throw error if no callback passed', function() {
    expect(() => callbacks.add(1, 14)).to.throw(Error)
  })

  it('should throw error if no id passed', function() {
    expect(() => callbacks.add()).to.throw(Error)
  })

  it('should throw error if no ttl passed', function() {
    expect(() => callbacks.add(1, function() {})).to.throw(Error)
  })

  it('should throw error if not unique id', function() {
    callbacks.add(1, noop, 1e3)
    expect(() => callbacks.add(1, noop, 1e3)).to.throw(Error)
  })

  it('should return correct callback', function(done) {
    let cid = 'foo'
    callbacks.add(cid, done, 1e3)
    let cb = callbacks.get(cid)
    expect(cb).to.be.a('function')
    cb()
  })

  it('should return callback only once', function() {
    let cid = 'foo'
    callbacks.add(cid, noop, 1e3)
    callbacks.get(cid)
    let nothing = callbacks.get(cid)
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
      let spy = sinon.spy()
      let cid = 'foo'
      callbacks.add(cid, spy, 10)

      this.clock.tick(20)

      expect(callbacks.get(cid)).to.be.undefined
      expect(spy).to.have.been.calledOnce
      expect(spy.getCall(0).args[0].message)
        .to.be.eq('Method execution exceeded the time limit of `10`')
    })
  })

  describe('release', function() {
    it('should release all waiting callbacks', function() {
      let spy1 = sinon.spy()
      let spy2 = sinon.spy()
      let cid1 = '1'
      callbacks.add(cid1, spy1, 1e3)
      let cid2 = '2'
      callbacks.add(cid2, spy2, 1e3)
      callbacks.releaseAll()

      expect(spy1).to.have.been.calledOnce
      expect(spy1.getCall(0).args[0].message)
        .to.be.eq('Request callback was released.')
      expect(callbacks.get(cid1)).to.be.undefined

      expect(spy2).to.have.been.calledOnce
      expect(spy2.getCall(0).args[0].message)
        .to.be.eq('Request callback was released.')
      expect(callbacks.get(cid2)).to.be.undefined
    })
  })
})
