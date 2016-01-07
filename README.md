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
var cid = cbStore.add(function() {
  console.log('Hello world!')
})

/* ... */

var cb = cbStore.get(cid)
cb()
```


## License

The MIT License (MIT)
