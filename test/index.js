'use strict';

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var CallbackStore = require('../lib');
var noop = function() {};

describe('CallbackStore', function() {
  it('add throws error if not function passed', function() {
    var callbackStore = new CallbackStore();
    expect(function() {
        callbackStore.add(14);
      })
      .to.throw(Error, 'Invalid argument passed to CallbackStore.add. Function expected but got `number`.');
  });

  it('returns correct callback', function(done) {
    var callbackStore = new CallbackStore();
    var cid = callbackStore.add(done);
    var cb = callbackStore.get(cid);
    expect(cb).to.be.a('function');
    cb();
  });

  it('returns different correlation IDs', function() {
    var callbackStore = new CallbackStore();
    var cid1 = callbackStore.add(noop);
    var cid2 = callbackStore.add(noop);
    expect(cid1).to.not.eq(cid2);
  });

  it('returns callback only once', function() {
    var callbackStore = new CallbackStore();
    var cid = callbackStore.add(noop);
    callbackStore.get(cid);
    var nothing = callbackStore.get(cid);
    expect(nothing).to.be.null;
  });

  it('if request timed out the callback function is called with an error', function(done) {
    var callbackStore = new CallbackStore({
      ttl: 10
    });
    var cid = callbackStore.add(function(err) {
      expect(err.message).to.be.equal('Response timed out.');
      expect(callbackStore.get(cid)).to.be.null;
      done();
    });
  });

  describe('release', function() {
    it('should release all waiting callbacks', function() {
      var spy1 = sinon.spy();
      var spy2 = sinon.spy();
      var callbackStore = new CallbackStore();
      var cid1 = callbackStore.add(spy1);
      var cid2 = callbackStore.add(spy2);
      callbackStore.releaseAll();

      expect(spy1.calledOnce).to.be.true;
      expect(spy1.getCall(0).args[0].message).to.be.equal('Request callback was released.');
      expect(callbackStore.get(cid1)).to.be.null;

      expect(spy2.calledOnce).to.be.true;
      expect(spy2.getCall(0).args[0].message).to.be.equal('Request callback was released.');
      expect(callbackStore.get(cid2)).to.be.null;
    });
  });
});