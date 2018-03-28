/* eslint-env browser */
/* global goog */
goog.provide('ti.ed2khash')

var ed2khash = function () {
  'use strict'
  var prop = {
    'onprogress': null,
    'onfilecomplete': null,
    'onallcomplete': null,
    'onerror': null,
    'isbusy': isbusy,
    'execute': execute,
    'terminate': terminate
  }
  var reader = new FileReader()
  var md4_worker = new Worker('md4-worker.min.js')

  var files = null
  var fileoffset = -1
  var before = null
  var die = true
  var busy = false
  var total_size = 0
  var total_multiplier = 0
  var total_processed = 0
  var multipliers = []

  md4_worker.onerror = function (e) {
    die = true
    console.error('web worker error', e)
    if (prop['onerror']) {
      setTimeout(prop['onerror'], 1, { message: 'Something wrong with HTML5' +
        ' Web Worker. The error is...\n\n' + e.message })
    }
  }

  function ed2k_file (file) {
    'use strict'
    var offset = 0
    var offset_i = 0
    var queue = 0
    var chunks = []
    var chunks_i = []
    var busy_read = false
    var busy_work = false
    var md4_list = []
    var delay_work = []

    die = false

    md4_worker.onmessage = function (e) {
      if (goog.DEBUG)
        delay_work[e.data['i']] = Date.now() - delay_work[e.data['i']]
      md4_list[e.data['i']] = e.data['h']
      busy_work = false
      e.data['d'] = null
      queue -= 1
      deferProgressCallback(e.data['i'])
      process()
    }

    reader.onload = function (evt) {
      chunks[offset_i] = evt.target.result
      chunks_i.push(offset_i)
      busy_read = false
      offset += 9728000
      offset_i += 1
      process()
    }
    reader.onerror = function (evt) {
      die = true
      console.error('read error', evt.target)
      if (prop['onerror']) {
        setTimeout(prop['onerror'], 1, { message: 'Something wrong with HTML5' +
          'FileReader. The error is...\n\n' + evt.target.error })
      }
    }

    function process () {
      if (die) {
        busy = false
        return
      }
      if (goog.DEBUG) {
        console.log('status: ' + offset + '/' + file.size + ' read=' +
          busy_read + ' work=' + busy_work + ' queue=' + queue)
      }

      if (queue > 0 && chunks_i.length > 0 && !busy_work) {
        var index = chunks_i.shift()
        var chunk = chunks[index]
        if (goog.DEBUG) delay_work[index] = Date.now()
        busy_work = true
        md4_worker.postMessage({'i': index, 'd': chunk}, [chunk])
        chunks[index] = null
      }

      if (offset <= file.size && !busy_read && queue < 6) {
        busy_read = true
        queue += 1
        reader.readAsArrayBuffer(file.slice(offset, offset + 9728000))
      } else if (!busy_read && !busy_work && queue === 0) {
        if (file.size >= 9728000) {
          // calculate final hash...
          md4_worker.onmessage = function (e) {
            if (prop['onfilecomplete']) {
              setTimeout(prop['onfilecomplete'], 1, file,
                arrayBufferToHexDigest(e.data['h']))
            }
            processNextFile()
          }
          md4_worker.postMessage({'f': true, 'hl': md4_list})
          die = true
        } else {
          if (prop['onfilecomplete']) {
            setTimeout(prop['onfilecomplete'], 1, file,
              arrayBufferToHexDigest(md4_list[0]))
          }
          processNextFile()
        }
        if (goog.DEBUG)
          console.log('worker delay for each chunk in ms=' + delay_work.join(', '))
        total_processed += file.size
      }
    }

    function deferProgressCallback (index) {
      if (prop['onprogress']) {
        var tmp_file = fileoffset
        var tmp_total_processed = total_processed
        setTimeout(function () {
          prop['onprogress'](file,
            multipliers[tmp_file] * (index + 1) * 9728000,
            total_multiplier * (tmp_total_processed + (index + 1) * 9728000))
        }, 25)
      }
    }

    deferProgressCallback(-1)
    process()
  }

  function isbusy () {
    return busy === true
  }

  function execute (_files) {
    if (busy) {
      console.error('currently busy processing')
      return
    }
    files = _files
    total_size = files.reduce(function (a, b) { return a + b.size }, 0)
    total_multiplier = 1 / total_size
    total_processed = 0
    multipliers = files.map(function (a) { return 1 / a.size })
    fileoffset = -1
    before = Date.now()
    busy = true

    processNextFile()
  }

  function terminate () {
    die = true
  }

  function processNextFile () {
    if (files[++fileoffset]) {
      ed2k_file(files[fileoffset])
    } else {
      console.log('all files complete. took ' + (Date.now() - before) + 'ms')
      if (prop['onallcomplete'])
        setTimeout(prop['onallcomplete'], 1)
      busy = false
    }
  }

  function arrayBufferToHexDigest (arr) {
    // taken from js-md4
    var HEX_CHARS = '0123456789abcdef'.split('')
    var blocks = new Uint32Array(arr)
    var h0 = blocks[0]
    var h1 = blocks[1]
    var h2 = blocks[2]
    var h3 = blocks[3]

    return HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
    HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F] +
    HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F] +
    HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F] +
    HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
    HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F] +
    HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F] +
    HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F] +
    HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
    HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F] +
    HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F] +
    HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F] +
    HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
    HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F] +
    HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F] +
    HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F]
  }

  return prop
}

window['ed2khash'] = ed2khash

if (goog.DEBUG) {
  var module = module || {}

  /* not a release, testing? */
  console.log('we\'re testing')
  module.exports = {
    ed2khash: ed2khash
  }
}
