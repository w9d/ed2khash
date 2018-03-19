'use strict'

/* eslint-env browser */
const xorshift7 = require('./xorshift7.js')

var genZero = function (size) {
  var buffer = new Uint8Array(size)
  return buffer.buffer
}

var genRand = function (size, seed) {
  var buffer = new Int8Array(size)
  var xors7 = xorshift7(seed || 1963272565)
  var data
  for (var start = 0; start < size; start += 4) {
    data = xors7.int32()
    // console.log('loop outer start=' + start + ' size=' + size)
    for (var off = start, i = 0;
      off < start + 4 && start + i < size;
      off += 1, i += 1) {
      buffer[off] = (data >> i * 8) & 0xff
      // console.log('loop inner start=' + start, 'off=' + off, 'shift=' + i*8)
    }
  }
  return buffer.buffer
}

var GenFile = function (generator, size, options) {
  var opt = options || {}
  var file
  try {
    file = new File([generator(size, opt.seed)], opt.name || 'test.mp4',
      {type: 'video/mp4'})
  } catch (e) {
    // Microsoft workaround
    file = new Blob([generator(size, opt.seed)], {type: 'video/mp4'})
  }
  return file
}

module.exports = {
  genZero: genZero,
  genRand: genRand,
  GenFile: GenFile
}
