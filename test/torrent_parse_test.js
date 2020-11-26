'use strict'
/* global goog */
goog.module('ed2khash.torrent_parse.test')
const Torrent_parse = goog.require('ed2khash.torrent_parse')

const test = require('tape')
const com = require('../test/common.js')
//const torrent_parse = require('../build-rel/torrent_parse.min.js')
// mini tests for torrent_parse only

test('test single ordered', t => {
  t.plan(1)
  const f = com.atob('ZDg6YW5ub3VuY2U0Njp1ZHA6Ly90cmFja2VyLmRhdGFjZW50ZXJsaWdodC5jaDo2OTY5L2Fubm91bmNlMTA6Y3JlYXRlZCBieTEzOm1rdG9ycmVudCAxLjExMzpjcmVhdGlvbiBkYXRlaTE2MDUzMDI4MzBlNDppbmZvZDY6bGVuZ3RoaTEwZTQ6bmFtZTEzOnRlc3RfZmlsZS50eHQxMjpwaWVjZSBsZW5ndGhpMjYyMTQ0ZTY6cGllY2VzMjA6+MQSJ4kElTqMaoNerGZpOcEwXrZlZQ==')
  const a = new Torrent_parse(f)
  //for (var b in a) {console.log(b)}
  t.equal(a.info_hash(), 'ee987f0ff46a8c2d7dab8b24eb4bb577e0286031')
})

test('test dir ordered', function (t) {
  t.plan(1)
  const f = com.atob('ZDg6YW5ub3VuY2U0Njp1ZHA6Ly90cmFja2VyLmRhdGFjZW50ZXJsaWdodC5jaDo2OTY5L2Fubm91bmNlMTA6Y3JlYXRlZCBieTEzOm1rdG9ycmVudCAxLjExMzpjcmVhdGlvbiBkYXRlaTE2MDUzNzI1MTVlNDppbmZvZDU6ZmlsZXNsZDY6bGVuZ3RoaTExZTQ6cGF0aGwxNDp0ZXN0X2ZpbGUxLnR4dGVlZDY6bGVuZ3RoaTExZTQ6cGF0aGwxNDp0ZXN0X2ZpbGUyLnR4dGVlZTQ6bmFtZTE0OnRlc3RfZGlyZWN0b3J5MTI6cGllY2UgbGVuZ3RoaTI2MjE0NGU2OnBpZWNlczIwOhlBOXOWew/dfI91j1Na5W1mjynZZWU=')
  const a = new Torrent_parse(f)
  t.equal(a.info_hash(), '4e62d9a03098657ccd4759b0a19c39973b3bc261')
})

test('test single unordered', function (t) {
  t.plan(2)
  const f = 'd4:infod4:name5:b.txt6:lengthi1e12:piece lengthi32768e6:pieces20:1234567890abcdefghijee'
  try {
    const a = new Torrent_parse(f)
    t.fail()
  } catch (err) { t.pass() } finally { t.pass() }
})
