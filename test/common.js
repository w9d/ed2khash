'use strict'

var genZero = function(size) {
  var buffer = new Uint8Array(size)
  return buffer.buffer
}

var genFile = function(generator, size, name) {
  return new File([generator(size)], name || 'test.mp4')
}

module.exports = {
  genZero: genZero,
  genFile: genFile
}
