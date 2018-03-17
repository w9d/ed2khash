var ed2k_files = function(files, opts) {
'use strict'
  var prop = { onprogress: null, onfilecomplete: null, onallcomplete: null,
    execute: execute, terminate: terminate }

  var reader = new FileReader(), before = null
  var fileoffset = -1, md4_worker = new Worker('md4-worker.js'), die = false

  md4_worker.onerror = function(e) {
    die = true
    console.error('web worker error', e)
    window.alert('Something wrong with HTML5 Web Worker.' +
      ' The error is...\n\n' + e.message)
  }

  var total_size = files.reduce(function(a,b){return a+b.size}, 0)
  var total_multiplier = 1 / total_size
  var total_processed = 0
  var multipliers = files.map(function(a){return 1/a.size})

  function ed2k_file(file) {
    'use strict'
    var offset = 0, offset_i = 0, queue = 0, chunks = [], chunks_i = [],
        busy_read = false, busy_work = false, md4_list = []
    die = false

    md4_worker.onmessage = function(e) {
      md4_list[e.data.index] = e.data.md4
      busy_work = false
      e.data.dirty = null
      delete e.data.dirty
      queue -= 1
      process()
    }

    reader.onload = function(evt) {
      chunks[offset_i] = evt.target.result
      chunks_i.push(offset_i)
      busy_read = false
      offset += 9728000
      offset_i += 1
      if (prop.onprogress) {
        setTimeout(prop.onprogress, 1, file,
          multipliers[fileoffset] * offset,
          total_multiplier * (total_processed + offset))
      }
      process()
    }
    reader.onerror = function(evt) {
      die = true
      console.error('read error', evt.target)
      window.alert('Something wrong with HTML5 FileReader.' +
      ' The error is...\n\n' + evt.target.error)
    }

    function process() {
      if (die)
        return
      console.log('status: '+offset+'/'+file.size+' read='+busy_read+
          ' work='+busy_work+' queue='+queue)

      if (queue > 0 && chunks_i.length > 0 && !busy_work) {
        var index = chunks_i.shift()
        var chunk = chunks[index]
        busy_work = true
        md4_worker.postMessage({workerid:1, index: index, data: chunk},
            [chunk])
        chunks[index] = null
      }

      if (offset <= file.size && !busy_read && queue < 6) {
        busy_read = true
        queue += 1
        reader.readAsArrayBuffer(file.slice(offset, offset+9728000))
      } else if (!busy_read && !busy_work && queue === 0) {
        if (!prop.onfilecomplete)
          return

        if (file.size >= 9728000) {
          // calculate final hash...
          md4_worker.onmessage = function(e) {
            setTimeout(prop.onfilecomplete, 1, file,
              arrayBufferToHexDigest(e.data.ed2khash))
            processNextFile()
          }
          md4_worker.postMessage({finish: true, md4_list: md4_list})
          die = true
        } else {
          setTimeout(prop.onfilecomplete, 1, file,
            arrayBufferToHexDigest(md4_list[0]))
          processNextFile()
        }
        total_processed += file.size
      }
    }

    process()
  }

  function arrayBufferToHexDigest(arr) {
    // taken from js-md4
    var HEX_CHARS = '0123456789abcdef'.split('')
    var blocks = new Uint32Array(arr)
    var h0 = blocks[0], h1 = blocks[1], h2 = blocks[2], h3 = blocks[3]

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

  function processNextFile() {
    if (files[++fileoffset]) {
      ed2k_file(files[fileoffset])
    } else {
      console.log('all files complete. took ' + (Date.now() - before) + 'ms')
      if (prop.onallcomplete)
        setTimeout(prop.onallcomplete, 1)
    }
  }

  function execute() {
    before = Date.now()
    processNextFile()
  }

  function terminate() {
    die = true
  }

  return prop
}

if (typeof window === 'object' && typeof process === 'object' &&
    typeof process.versions === 'object') {
  if (typeof process.versions.node === 'undefined') {
    /* this looks like a browser in a testing configuration */
    console.log('we\'re testing')
    module.exports = {
      ed2k_files: ed2k_files
    }
  }
}
