'use strict';

var chai = require('chai');
var expect = chai.expect;
var CallbackStore = require('../lib');
var noop = function () {};

describe('CallbackStore', function () {
  it('add throws error if not function passed', function () {
    var callbackStore = new CallbackStore();
    expect(function () {
        callbackStore.add(14);
      })
      .to.throw(Error, 'Invalid argument passed to CallbackStore.add. Function expected but got `number`.');
  });

  it('returns correct callback', function (done) {
    var callbackStore = new CallbackStore();
    var cId = callbackStore.add(done);
    var cb = callbackStore.get(cId);
    expect(cb).to.be.a('function');
    cb();
  });

  it('returns different correlation IDs', function () {
    var callbackStore = new CallbackStore();
    var cId1 = callbackStore.add(noop);
    var cId2 = callbackStore.add(noop);
    expect(cId1).to.not.equal(cId2);
  });

  it('returns callback only once', function () {
    var callbackStore = new CallbackStore();
    var cId = callbackStore.add(noop);
    callbackStore.get(cId);
    var nothing = callbackStore.get(cId);
    expect(nothing).to.be.null;
  });

  it('if request timed out the callback function is called with an error', function (done) {
    var callbackStore = new CallbackStore({
      ttl: 10
    });
    var cId = callbackStore.add(function (err) {
      expect(err.message).to.be.equal('Response timed out.');
      expect(callbackStore.get(cId)).to.be.null;
      done();
    });
  });

  describe('release', function () {
    it('should release all waiting callbacks', function (done) {
      var releasesCount = 0;
      var callbackStore = new CallbackStore();
      var cId1 = callbackStore.add(function (err) {
        expect(err.message).to.be.equal('Request callback was released.');
        expect(callbackStore.get(cId1)).to.be.null;
        releasesCount++;
        if (releasesCount === 2) {
          done();
        }
      });
      var cId2 = callbackStore.add(function (err) {
        expect(err.message).to.be.equal('Request callback was released.');
        expect(callbackStore.get(cId2)).to.be.null;
        releasesCount++;
        if (releasesCount === 2) {
          done();
        }
      });
      
      callbackStore.releaseAll();
    });
  });
});