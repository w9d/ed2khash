importScripts('md4.js')

self.onmessage = function(e) {
'use strict'
  var reader = new FileReader()
  var fileoffset = -1, md4_worker = new Worker('md4-worker.js')
  md4_worker.onerror = function(e) { postMessage({event: 100, message: e.message}) }

  var total_size = e.data.files.reduce(function(a,b){return a+b.size}, 0)
  var total_multiplier = 1 / total_size
  var total_processed = 0
  var multipliers = e.data.files.map(function(a){return 1/a.size})

  function ed2k_file(file) {
    'use strict'
    var offset = 0, offset_i = 0, queue = 0, chunks = [], chunks_i = [],
        busy_read = false, busy_work = false, md4_list = []

    md4_worker.onmessage = function(e) {
      md4_list[e.data.index] = e.data.md4
      busy_work = false
      e.data.dirty = null
      delete e.data.dirty
      queue -= 1
      process(true)
    }

    reader.onloadend = function(evt) {
      chunks[offset_i] = evt.target.result
      chunks_i.push(offset_i)
      busy_read = false
      offset += 9728000
      offset_i += 1
      postMessage({event: 1, file: file,
          file_progress: multipliers[fileoffset] * offset,
          files_progress: total_multiplier * (total_processed + offset)})
      process(false)
    }

    function process(from_md4_worker) {
      console.log('status: '+offset+'/'+file.size+' read='+busy_read+
          ' work='+busy_work+' from_md4='+from_md4_worker+' queue='+queue)

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
      } else if (!busy_read && !busy_work && queue === 0 && from_md4_worker) {
        if (file.size >= 9728000) {
          // calculate final hash...
          md4_worker.onmessage = function(e) {
            postMessage({event: 2, file: file,
              ed2k_hash: arrayBufferToHexDigest(e.data.ed2khash)})
          }
          md4_worker.postMessage({finish: true, md4_list: md4_list})
        } else {
          postMessage({event: 2, file: file,
            ed2k_hash: arrayBufferToHexDigest(md4_list[0])})
        }
        total_processed += file.size
        processNextFile()
      }
    }

    process(false)
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
    if (e.data.files[++fileoffset]) {
      ed2k_file(e.data.files[fileoffset], undefined, undefined)
    } else {
      postMessage({event: 3})
    }
  }

  processNextFile()
}
