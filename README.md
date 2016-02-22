# callback-store

A store for callbacks waiting for delayed response.

[![Dependency Status](https://david-dm.org/zkochan/callback-store/status.svg?style=flat)](https://david-dm.org/zkochan/callback-store)
[![Build Status](https://travis-ci.org/zkochan/callback-store.svg?branch=master)](https://travis-ci.org/zkochan/callback-store)
[![npm version](https://badge.fury.io/js/callback-store.svg)](http://badge.fury.io/js/callback-store)
[![Coverage Status](https://coveralls.io/repos/github/zkochan/callback-store/badge.svg?branch=master)](https://coveralls.io/github/zkochan/callback-store?branch=master)


## Installation

```
npm install --save callback-store
```


## Usage

```js
const cbStore = require('callback-store')

let callbacks = cbStore()
let uid = Math.random()
callbacks.add(uid, function(err) {
  if (err) {
    /* An error will happen if the callback isn't executed during 5 seconds */
    return
  }
  console.log('Hello world!')
}, 5000)

/* ... */

let cb = callbacks.get(uid)
cb()
```


## License

MIT © [Zoltan Kochan](https://www.kochan.io)
