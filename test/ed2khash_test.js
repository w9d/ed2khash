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

const ed2k = require('../build-rel/ed2khash.min.js')

test('1 file 1 chunk-1 zeros', function (t) {
  t.plan(1)
  var f = new com.GenFile(com.genZero, 9727999)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, 'ac44b93fc9aff773ab0005c911f8396f')
  }
  a.execute([f])
})

test('1 file 1 chunk zeros', function (t) {
  t.plan(1)
  var f = new com.GenFile(com.genZero, 9728000)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, 'fc21d9af828f92a8df64beac3357425d')
  }
  a.execute([f])
})

test('1 file 1 chunk+1 zeros', function (t) {
  t.plan(1)
  var f = new com.GenFile(com.genZero, 9728001)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, '06329e9dba1373512c06386fe29e3c65')
  }
  a.execute([f])
})

test('1 file 2 chunks-1 zeros', function (t) {
  t.plan(1)
  var f = new com.GenFile(com.genZero, 19455999)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, 'a4aed104a077de7e4210e7f5b131fe25')
  }
  a.execute([f])
})

test('1 file 2 chunks zeros', function (t) {
  t.plan(1)
  var f = new com.GenFile(com.genZero, 19456000)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, '114b21c63a74b6ca922291a11177dd5c')
  }
  a.execute([f])
})

test('1 file 2 chunks+1 zeros', function (t) {
  t.plan(1)
  var f = new com.GenFile(com.genZero, 19456001)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, 'e57f824d28f69fe90864e17673668457')
  }
  a.execute([f])
})

test('1 file 1 chunk-1 random', function (t) {
  t.plan(1)
  var f = com.GenFile(com.genRand, 9727999)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, '4b3edce7128daee5acf803ef4b14004d')
  }
  a.execute([f])
})

test('1 file 1 chunk random', function (t) {
  t.plan(1)
  var f = com.GenFile(com.genRand, 9728000)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, 'df1ad062dc5b2b213288f722c0d683b9')
  }
  a.execute([f])
})

test('1 file 1 chunk+1 random', function (t) {
  t.plan(1)
  var f = com.GenFile(com.genRand, 9728001)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, '74c23c0baeef195a01c5b28aa19b48de')
  }
  a.execute([f])
})

test('onprogress callback 2', function (t) {
  t.plan(1)
  var count = 0
  var f = com.GenFile(com.genRand, 19455999)
  var a = ed2k.ed2khash()
  a.onprogress = function (a, b, c) { count += 1 }
  setTimeout(function () {
    if (count !== 3)
      t.fail('got ' + count + ' callbacks instead of 3')
    else
      t.pass('correct')
  }, 2000)
  a.execute([f])
})

test('onprogress callback 3', function (t) {
  t.plan(1)
  var count = 0
  var f = com.GenFile(com.genRand, 19456000)
  var a = ed2k.ed2khash()
  a.onprogress = function (a, b, c) { count += 1 }
  setTimeout(function () {
    if (count !== 4)
      t.fail('got ' + count + ' callbacks instead of 4')
    else
      t.pass('correct')
  }, 2000)
  a.execute([f])
})

test('onallcomplete callback 2 files', function (t) {
  t.plan(1)
  var count = 0
  var f = [com.GenFile(com.genRand, 20000000, {name: 'test1.mkv'}),
    com.GenFile(com.genZero, 9000000, {name: 'test2.mp4'})]
  var a = ed2k.ed2khash()
  a.onfilecomplete = function () {}
  a.onallcomplete = function () { count += 1 }
  setTimeout(function () {
    if (count !== 1)
      t.fail('got ' + count + ' callbacks instead of 1')
    else
      t.pass('got 1 callback as expected')
  }, 3000)
  a.execute(f)
})

test('terminate script', function (t) {
  t.plan(1)
  var count = 0
  var f1 = com.GenFile(com.genZero, 58368123)
  var a = ed2k.ed2khash()
  a.onprogress = function () {
    if (++count === 2)
      a.terminate()
  }
  setTimeout(function () {
    if (count < 3 || count > 4)
      t.fail('got ' + count + ' callbacks instead of 3 or 4')
    else
      t.pass('correct with ' + count + ' callbacks')
  }, 5000)
  a.execute([f1])
})

test('standard run', function (t) {
  t.plan(2)
  var count = 0
  var good = 0
  var finish = 0
  var f = [com.GenFile(com.genRand, 14592123, {name: 't1.mp4', seed: 1291769473}),
    com.GenFile(com.genRand, 33075212, {name: 't2.mp4', seed: 220482059}),
    com.GenFile(com.genRand, 24324321, {name: 't3.mp4', seed: 1283955684})]
  var info = [ { name: 't1.mp4', size: 14592123, hash: '25250410dc9672f15e5f37c96f2969b9' },
    { name: 't2.mp4', size: 33075212, hash: '3dfca2c114476e2c3a993007b3568f1b' },
    { name: 't3.mp4', size: 24324321, hash: '4e020dfd7f784b490b23ba85fadbc9f3' },
    { name: 'NEVERHAPPENF', size: 1099511627776, hash: 'NEVERHAPPENH' }]
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    if (info[count].hash === _hash.ed2k &&
      info[count].name === _file.name &&
      info[count].size === _file.size)
      good++
    count++
  }
  a.onallcomplete = function () { finish += 1 }
  setTimeout(function () {
    if (good === 3)
      t.pass('good files')
    else
      t.fail('got ' + good + ' successful files processed instead of 3')
    if (finish === 1)
      t.pass('good finish')
    else
      t.fail('got ' + finish + ' finishes instead of 1')
  }, 6000)
  a.execute(f)
})

test('standard run reuse', function (t) {
  t.plan(2)
  var count = 0
  var good = 0
  var bad = 0
  var finish = 0
  var f = [com.GenFile(com.genRand, 14592123, {name: 't1.mp4', seed: 1291769473}),
    com.GenFile(com.genRand, 33075212, {name: 't2.mp4', seed: 220482059}),
    com.GenFile(com.genRand, 24324321, {name: 't3.mp4', seed: 1283955684})]
  var info = [ { name: 't1.mp4', size: 14592123, hash: '25250410dc9672f15e5f37c96f2969b9' },
    { name: 't2.mp4', size: 33075212, hash: '3dfca2c114476e2c3a993007b3568f1b' },
    { name: 't3.mp4', size: 24324321, hash: '4e020dfd7f784b490b23ba85fadbc9f3' },
    { name: 'NEVERHAPPENF', size: 1099511627776, hash: 'NEVERHAPPENH' }]
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    if (info[good].hash === _hash.ed2k &&
      info[good].name === _file.name &&
      info[good].size === _file.size)
      good++
    else
      bad++
  }
  a.onallcomplete = function () {
    finish += 1
    if (count < 3)
      a.execute([f[count++]])
  }
  setTimeout(function () {
    if (good === 3 && bad === 0)
      t.pass('good files')
    else
      t.fail('got ' + good + ' successful files processed instead of 3')
    if (finish === 3)
      t.pass('good finish')
    else
      t.fail('got ' + finish + ' finishes instead of 3')
  }, 6000)
  a.execute([f[count++]])
})

test('standard run reuse guard', function (t) {
  t.plan(2)
  var progess_count = 0
  var good = 0
  var bad = 0
  var finish = 0
  var f = [com.GenFile(com.genRand, 33075212, {name: 't2.mp4', seed: 220482059}),
    com.GenFile(com.genRand, 24324321, {name: 't3.mp4', seed: 1283955684})]
  var info = { name: 't2.mp4', size: 33075212, hash: '3dfca2c114476e2c3a993007b3568f1b' }
  var a = ed2k.ed2khash()
  a.onprogress = function () {
    if (++progess_count === 3)
      a.execute([f[1]])
  }
  a.onfilecomplete = function (_file, _hash) {
    if (info.hash === _hash.ed2k &&
      info.name === _file.name &&
      info.size === _file.size)
      good++
    else
      bad++
  }
  a.onallcomplete = function () {
    finish += 1
  }
  setTimeout(function () {
    if (good === 1 && bad === 0)
      t.pass('good files')
    else
      t.fail('got ' + good + ' successful and ' + bad + ' bad')
    if (finish === 1)
      t.pass('good finish')
    else
      t.fail('got ' + finish + ' finishes instead of 1')
  }, 4000)
  a.execute([f[0]])
})

test('standard run isbusy', function (t) {
  t.plan(14)
  var progess_count = 0
  var f = [com.GenFile(com.genRand, 33075212, {name: 't2.mp4', seed: 220482059}),
    com.GenFile(com.genRand, 24324321, {name: 't3.mp4', seed: 1283955684})]
  var a = ed2k.ed2khash()
  a.onprogress = function () {
    // 5 executions first
    // 4 executions second
    t.equal(a.isbusy(), true)
  }
  a.onfilecomplete = function (_file, _hash) {
    if (++progess_count === 1)
      t.equal(a.isbusy(), true)
    else
      t.equal(a.isbusy(), false)
  }
  a.onallcomplete = function () {
    t.equal(a.isbusy(), false)
  }
  t.equal(a.isbusy(), false)
  a.execute(f)
  t.equal(a.isbusy(), true)
})
