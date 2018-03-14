var ed2k_files = function(files, opts) {
'use strict';
  var worker = null;
  var prop = { onprogress: null, onfilecomplete: null, onallcomplete: null,
    execute: execute, terminate: terminate };

  function execute() {
    if (!window.Worker) {
      window.alert('Browser does not support HTML5 Web Workers.\n\nYou cannot' +
        ' use this browser. Sorry.');
      console.log('Browser does not support HTML5 Web Workers. You cannot' +
        ' use this browser. Sorry.');
      return;
    }

    worker = new Worker('ed2k_hasher_basic-worker.js');
    worker.onerror = function(e) {
      window.alert('Something wrong with HTML5 Web Worker. The error is...\n\n'
          + e.message);
    }
    worker.onmessage = function(e) {
      if (e.data.event === 1) {
        // progress event
        (prop.onprogress) && prop.onprogress(e.data.file, e.data.file_progress,
            e.data.files_progress);
        //console.log('chunk processed ' + Date.now());
      } else if (e.data.event === 2) {
        // onfilecomplete event
        (prop.onfilecomplete) && prop.onfilecomplete(e.data.file, e.data.ed2k_hash);
      } else if (e.data.event === 3) {
        // onallcomplete event
        (prop.onallcomplete) && prop.onallcomplete();
      } else if (e.data.event === 100) {
        // md4 sub worker error
        worker.terminate();
        window.alert('Something wrong with HTML5 Sub Web Worker. The error is...\n\n'
            + e.data.message);
        worker = null;
      } else {
        window.alert('This should never ever happen.');
      }
    }
    worker.postMessage({files: files});
  }

  function terminate() {
    if (worker) {
      worker.terminate();
      worker = null;
    }
  }

  return prop;
}

if (typeof window !== 'object' && typeof process === 'object' &&
    process.versions && process.versions.node) {
  var passMocks = function(_window, _navigator, _md4) {
    window = _window;
    navigator = _navigator;
    md4 = _md4;
  };
  ED2K_NODE_ENVIRON = true;
  module.exports = {
    ed2k_files: ed2k_files,
    passMocks: passMocks
  };
}