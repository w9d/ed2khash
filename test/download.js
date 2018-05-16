var filesaver = require('file-saver')
var com = require('./common.js')

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart (targetLength, padString) {
    // truncate if number or convert non-number to 0
    targetLength = targetLength >> 0
    padString = String((typeof padString !== 'undefined' ? padString : ' '))
    if (this.length > targetLength) {
      return String(this)
    } else {
      targetLength = targetLength - this.length
      if (targetLength > padString.length) {
        // append to original to ensure we are longer than needed
        padString += padString.repeat(targetLength / padString.length)
      }
      return padString.slice(0, targetLength) + String(this)
    }
  }
}

var files = [
  {s: 65534, c: 1173245347},
  {s: 65535, c: 1173245347},
  {s: 65536, c: 1173245347},
  {s: 65537, c: 1173245347}
]

for (var i = 0, file; (file = files[i]); i++) {
  console.log('file download for size ' + file.s)
  var f = com.GenFile(com.genRand, file.s, {seed: file.c})

  filesaver.saveAs(f,
    'rand_' + String(i).padStart(3, '0') + '_' + file.s + '.mp4', true)
}
