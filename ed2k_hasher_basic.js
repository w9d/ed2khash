var ed2k_files = function(files, opts) {
'use strict'
  var worker = null
  var prop = { onprogress: null, onfilecomplete: null, onallcomplete: null,
    execute: execute, terminate: terminate }

  function execute() {
    if (!window.Worker) {
      window.alert('Browser does not support HTML5 Web Workers.\n\nYou cannot' +
        ' use this browser. Sorry.')
      console.log('Browser does not support HTML5 Web Workers. You cannot' +
        ' use this browser. Sorry.')
      return
    }

    worker = new Worker('ed2k_hasher_basic-worker.js')
    worker.onerror = function(e) {
      window.alert('Something wrong with HTML5 Web Worker. The error is...\n\n'
          + e.message)
    }
    worker.onmessage = function(e) {
      if (e.data.event === 1) {
        // progress event
        if (prop.onprogress) {
          prop.onprogress(e.data.file, e.data.file_progress,
            e.data.files_progress)
        }
      } else if (e.data.event === 2) {
        // onfilecomplete event
        if (prop.onfilecomplete)
          prop.onfilecomplete(e.data.file, e.data.ed2k_hash)
      } else if (e.data.event === 3) {
        // onallcomplete event
        if (prop.onallcomplete)
          prop.onallcomplete()
      } else if (e.data.event === 100) {
        // md4 sub worker error
        worker.terminate()
        worker = null
        window.alert('Something wrong with HTML5 Sub Web Worker.' +
          ' The error is...\n\n' + e.data.message)
      } else {
        window.alert('This should never ever happen.')
      }
    }
    worker.postMessage({files: files})
  }

  function terminate() {
    if (worker) {
      worker.terminate()
      worker = null
    }
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