'use strict'

// with nullend:
// a4aed104a077de7e4210e7f5b131fe25  test_19455999_zeros.bin
// 114b21c63a74b6ca922291a11177dd5c  test_19456000_zeros.bin
// e57f824d28f69fe90864e17673668457  test_19456001_zeros.bin
// ac44b93fc9aff773ab0005c911f8396f  test_9727999_zeros.bin
// fc21d9af828f92a8df64beac3357425d  test_9728000_zeros.bin
// 06329e9dba1373512c06386fe29e3c65  test_9728001_zeros.bin
// without nullend:
// a4aed104a077de7e4210e7f5b131fe25  test_19455999_zeros.bin
// 194ee9e4fa79b2ee9f8829284c466051  test_19456000_zeros.bin
// e57f824d28f69fe90864e17673668457  test_19456001_zeros.bin
// ac44b93fc9aff773ab0005c911f8396f  test_9727999_zeros.bin
// d7def262a127cd79096a108e7a9fc138  test_9728000_zeros.bin
// 06329e9dba1373512c06386fe29e3c65  test_9728001_zeros.bin

const test = require('tape')
const com = require('./common.js')

const ed2k = require('../ed2khash.js')

test('single file single chunk-1 zeros with nullend', function(t) {
    t.plan(1)
    var test = new com.genFile(com.genZero, 9727999)
    var c = function(_file, _hash) {
      t.equal(_hash, 'ac44b93fc9aff773ab0005c911f8396f')
    }
    var a = ed2k.ed2k_files([test])
    a.onfilecomplete = c
    a.execute()
})

test('single file single chunk zeros with nullend', function(t) {
    t.plan(1)
    var test = new com.genFile(com.genZero, 9728000)
    var c = function(_file, _hash) {
      t.equal(_hash, 'fc21d9af828f92a8df64beac3357425d')
    }
    var a = ed2k.ed2k_files([test])
    a.onfilecomplete = c
    a.execute()
})

test('single file single chunk+1 zeros with nullend', function(t) {
    t.plan(1)
    var test = new com.genFile(com.genZero, 9728001)
    var c = function(_file, _hash) {
      t.equal(_hash, '06329e9dba1373512c06386fe29e3c65')
    }
    var a = ed2k.ed2k_files([test])
    a.onfilecomplete = c
    a.execute()
})

test('single file two chunks-1 zeros with nullend', function(t) {
    t.plan(1)
    var test = new com.genFile(com.genZero, 19455999)
    var c = function(_file, _hash) {
      t.equal(_hash, 'a4aed104a077de7e4210e7f5b131fe25')
    }
    var a = ed2k.ed2k_files([test])
    a.onfilecomplete = c
    a.execute()
})

test('single file two chunks zeros with nullend', function(t) {
    t.plan(1)
    var test = new com.genFile(com.genZero, 19456000)
    var c = function(_file, _hash) {
      t.equal(_hash, '114b21c63a74b6ca922291a11177dd5c')
    }
    var a = ed2k.ed2k_files([test])
    a.onfilecomplete = c
    a.execute()
})

test('single file two chunks+1 zeros with nullend', function(t) {
    t.plan(1)
    var test = new com.genFile(com.genZero, 19456001)
    var c = function(_file, _hash) {
      t.equal(_hash, 'e57f824d28f69fe90864e17673668457')
    }
    var a = ed2k.ed2k_files([test])
    a.onfilecomplete = c
    a.execute()
})
