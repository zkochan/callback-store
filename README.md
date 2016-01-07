# callback-store

A store for callbacks waiting for delayed response.

[![Dependency Status](https://david-dm.org/zkochan/callback-store/status.svg?style=flat)](https://david-dm.org/zkochan/callback-store)
[![Build Status](https://travis-ci.org/zkochan/callback-store.svg?branch=master)](https://travis-ci.org/zkochan/callback-store)
[![npm version](https://badge.fury.io/js/callback-store.svg)](http://badge.fury.io/js/callback-store)


## Installation

```
npm install --save callback-store
```


## Usage

```js
var CallbackStore = require('callback-store')

var cbStore = new CallbackStore()
var uid = Math.random()
cbStore.add(uid, function(err) {
  if (err) {
    /* An error will happen if the callback isn't executed during 5 seconds */
    return
  }
  console.log('Hello world!')
}, 5000)

/* ... */

var cb = cbStore.get(uid)
cb()
```


## License

The MIT License (MIT)
