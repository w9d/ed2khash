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
  t.plan(2)
  var f = com.GenFile(com.genZero, 9727999)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, 'ac44b93fc9aff773ab0005c911f8396f')
    t.equal(_hash.mpc, '0000000000946fff')
  }
  a.execute([f])
})

test('1 file 1 chunk zeros', function (t) {
  t.plan(2)
  var f = com.GenFile(com.genZero, 9728000)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, 'fc21d9af828f92a8df64beac3357425d')
    t.equal(_hash.mpc, '0000000000947000')
  }
  a.execute([f])
})

test('1 file 1 chunk+1 zeros', function (t) {
  t.plan(2)
  var f = com.GenFile(com.genZero, 9728001)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, '06329e9dba1373512c06386fe29e3c65')
    t.equal(_hash.mpc, '0000000000947001')
  }
  a.execute([f])
})

test('1 file 2 chunks-1 zeros', function (t) {
  t.plan(2)
  var f = com.GenFile(com.genZero, 19455999)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, 'a4aed104a077de7e4210e7f5b131fe25')
    t.equal(_hash.mpc, '000000000128dfff')
  }
  a.execute([f])
})

test('1 file 2 chunks zeros', function (t) {
  t.plan(2)
  var f = com.GenFile(com.genZero, 19456000)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, '114b21c63a74b6ca922291a11177dd5c')
    t.equal(_hash.mpc, '000000000128e000')
  }
  a.execute([f])
})

test('1 file 2 chunks+1 zeros', function (t) {
  t.plan(2)
  var f = com.GenFile(com.genZero, 19456001)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, 'e57f824d28f69fe90864e17673668457')
    t.equal(_hash.mpc, '000000000128e001')
  }
  a.execute([f])
})

test('1 file 1 chunk-1 random', function (t) {
  t.plan(2)
  var f = com.GenFile(com.genRand, 9727999)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, '4b3edce7128daee5acf803ef4b14004d')
    t.equal(_hash.mpc, 'bea62fa9a41ad3cb')
  }
  a.execute([f])
})

test('1 file 1 chunk random', function (t) {
  t.plan(2)
  var f = com.GenFile(com.genRand, 9728000)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, 'df1ad062dc5b2b213288f722c0d683b9')
    t.equal(_hash.mpc, 'f076768b31fb40e8')
  }
  a.execute([f])
})

test('1 file 1 chunk+1 random', function (t) {
  t.plan(2)
  var f = com.GenFile(com.genRand, 9728001)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    t.equal(_hash.ed2k, '74c23c0baeef195a01c5b28aa19b48de')
    t.equal(_hash.mpc, 'f6a846d213892159')
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
  var info = [ { name: 't1.mp4', size: 14592123, ed2k: '25250410dc9672f15e5f37c96f2969b9', mpc: 'f6182595a7c84b09' },
    { name: 't2.mp4', size: 33075212, ed2k: '3dfca2c114476e2c3a993007b3568f1b', mpc: 'f33912f3ee42c1f9' },
    { name: 't3.mp4', size: 24324321, ed2k: '4e020dfd7f784b490b23ba85fadbc9f3', mpc: '273370ab39fabc0b' },
    { name: 'NEVERHAPPENF', size: 1099511627776, ed2k: 'NEVERHAPPENH', mpc: 'NEVERHAPPENH' }]
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    if (info[count].ed2k === _hash.ed2k &&
      info[count].mpc === _hash.mpc &&
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
  var info = [ { name: 't1.mp4', size: 14592123, ed2k: '25250410dc9672f15e5f37c96f2969b9', mpc: 'f6182595a7c84b09' },
    { name: 't2.mp4', size: 33075212, ed2k: '3dfca2c114476e2c3a993007b3568f1b', mpc: 'f33912f3ee42c1f9' },
    { name: 't3.mp4', size: 24324321, ed2k: '4e020dfd7f784b490b23ba85fadbc9f3', mpc: '273370ab39fabc0b' },
    { name: 'NEVERHAPPENF', size: 1099511627776, ed2k: 'NEVERHAPPENH', mpc: 'NEVERHAPPENH' }]
  var a = ed2k.ed2khash()
  a.onfilecomplete = function (_file, _hash) {
    if (info[good].ed2k === _hash.ed2k &&
      info[good].mpc === _hash.mpc &&
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
  var info = { name: 't2.mp4', size: 33075212, ed2k: '3dfca2c114476e2c3a993007b3568f1b', mpc: 'f33912f3ee42c1f9' }
  var a = ed2k.ed2khash()
  a.onprogress = function () {
    if (++progess_count === 3)
      a.execute([f[1]])
  }
  a.onfilecomplete = function (_file, _hash) {
    if (info.ed2k === _hash.ed2k &&
      info.mpc === _hash.mpc &&
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

test('mpc 0', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, '31d6cfe0d16ae931b73c59d7e0c089c0')
    t.equal(_hash.mpc, '0000000000000000')
  }
  a.execute([com.GenFile(com.genZero, 0)])
})

test('mpc 1', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, 'be116c44d91edb8aece404982b305a11')
    t.equal(_hash.mpc, '0000000000000001')
  }
  a.execute([com.GenFile(com.genRand, 1, {seed: 1173245347})])
})

test('mpc 2', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, '908e85552d246063cd50a2f74da9a666')
    t.equal(_hash.mpc, '0000000000000002')
  }
  a.execute([com.GenFile(com.genRand, 2, {seed: 1173245347})])
})

test('mpc 3', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, 'e59af37cd61e68dee2ec7e6064c774e7')
    t.equal(_hash.mpc, '0000000000000003')
  }
  a.execute([com.GenFile(com.genRand, 3, {seed: 1173245347})])
})

test('mpc 4', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, '085761fa4dd8432d3fae77b9ba6a2723')
    t.equal(_hash.mpc, '0000000000000004')
  }
  a.execute([com.GenFile(com.genRand, 4, {seed: 1173245347})])
})

test('mpc 5', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, '85b45116423db9ea2762369a6c8684ad')
    t.equal(_hash.mpc, '0000000000000005')
  }
  a.execute([com.GenFile(com.genRand, 5, {seed: 1173245347})])
})

test('mpc 6', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, '2bcd4b171b40708f3e1564710798be1c')
    t.equal(_hash.mpc, '0000000000000006')
  }
  a.execute([com.GenFile(com.genRand, 6, {seed: 1173245347})])
})

test('mpc 7', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, 'f0fdfadb9baf91da6aa56cfb02da772d')
    t.equal(_hash.mpc, '0000000000000007')
  }
  a.execute([com.GenFile(com.genRand, 7, {seed: 1173245347})])
})

test('mpc 8', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, '7679ef2b26de9557cf04fc355e2b002e')
    t.equal(_hash.mpc, 'd723b862a2ec688e')
  }
  a.execute([com.GenFile(com.genRand, 8, {seed: 1173245347})])
})

test('mpc 9', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, 'a6853339514dd4ec6436185b8db4207f')
    t.equal(_hash.mpc, 'd723b862a2ec688f')
  }
  a.execute([com.GenFile(com.genRand, 9, {seed: 1173245347})])
})

test('mpc 15', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, '80d9da4fd0436f1eb0e51f1dcaf85aa7')
    t.equal(_hash.mpc, 'd723b862a2ec6895')
  }
  a.execute([com.GenFile(com.genRand, 15, {seed: 1173245347})])
})

test('mpc 16', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, '163416e088e6df2126e276ff0bf0624a')
    t.equal(_hash.mpc, 'd1a6494775088f4e')
  }
  a.execute([com.GenFile(com.genRand, 16, {seed: 1173245347})])
})

test('mpc 65534', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, '4dce0705879ba5bd79ce1a6d86950d47')
    t.equal(_hash.mpc, '6ac00ee93545bd90')
  }
  a.execute([com.GenFile(com.genRand, 65534, {seed: 1173245347})])
})

test('mpc 65535', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, '3e52ba92e1afa6f5868252a1d3070fd2')
    t.equal(_hash.mpc, '6ac00ee93545bd91')
  }
  a.execute([com.GenFile(com.genRand, 65535, {seed: 1173245347})])
})

test('mpc 65536', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, '49f5574ed6c1a0609f9550ee7e7257cb')
    t.equal(_hash.mpc, '22872ee87dee7e66')
  }
  a.execute([com.GenFile(com.genRand, 65536, {seed: 1173245347})])
})

test('mpc 65537', function(t) {
  t.plan(2)
  var a = ed2k.ed2khash()
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, '39f6c14db298be04422cda6dd3dbcdaa')
    t.equal(_hash.mpc, '1954db0bb336a5f9')
  }
  a.execute([com.GenFile(com.genRand, 65537, {seed: 1173245347})])
})

test('md4 clean env', function(t) {
  t.plan(6)
  var a = ed2k.ed2khash()
  var f = [
    com.GenFile(com.genText, 0, {seed: ''}),
    com.GenFile(com.genText, 0, {seed: 'The quick brown fox jumps over the lazy dog'}),
    com.GenFile(com.genText, 0, {seed: 'The quick brown fox jumps over the lazy dog.'}),
    com.GenFile(com.genText, 0, {seed: 'The MD5 message-digest algorithm is a widely used cryptographic hash function producing a 128-bit (16-byte) hash value, typically expressed in text format as a 32 digit hexadecimal number. MD5 has been utilized in a wide variety of cryptographic applications, and is also commonly used to verify data integrity.'}),
    com.GenFile(com.genText, 0, {seed: '0123456780123456780123456780123456780123456780123456780'}),
    com.GenFile(com.genText, 0, {seed: '01234567801234567801234567801234567801234567801234567801'})
  ]
  var hashes = [
    '31d6cfe0d16ae931b73c59d7e0c089c0',
    '1bee69a46ba811185c194762abaeae90',
    '2812c6c7136898c51f6f6739ad08750e',
    'e995876fc5a7870c478d20312edf17da',
    '91df808c37b8c5544391a3aa2196114e',
    '3825a0afe234b8029ccad9a31ec5f8ee'
  ]
  var i = 0
  a.onfilecomplete = function(_file, _hash) {
    t.equal(_hash.ed2k, hashes[i])
    i++
  }
  a.execute(f)
})
