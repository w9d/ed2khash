
var ed2k_file = ed2k_file || (function(f, ed2k_nullend, func_progress, func_finish) {
  "use strict";

  var readArray = [];
  var readOffset = 0;
  var readOffset_i = 0;
  var chunkQueue = 0;
  var fakeread_i = [];
  var work_manager = new workManager();

  var file_md4 = new Array();
  var comp_chunks = 0;
  var comp_multiplier = 100 / (Math.ceil(f.size / 9728000) +
    (ed2k_nullend && 1 || 0));
  var ed2k_nullend = ed2k_nullend && true;

  console.log('process_files: starting', f.name);
  setTimeout(processFiles, 0);

  function processFiles() {
    while (chunkQueue < 6 && !(readOffset > f.size)) {
      var file = new FileReader();

      //console.log('process_files: name=', f.name, 'offset=', readOffset, '/', f.size);

      file.readAsArrayBuffer(f.slice(readOffset, readOffset + 9728000));

      let tmp_readOffset_i = readOffset_i;
      file.addEventListener('loadend',
        function(evt) {
          readArray[tmp_readOffset_i] = evt.target.result;
          fakeread_i.push(tmp_readOffset_i);
          setTimeout(whatsHappening, 0);
        }, false
      );

      readOffset = readOffset + 9728000;
      readOffset_i += 1;
      chunkQueue += 1;
    }

    if (readOffset > f.size && chunkQueue <= 0 &&
        work_manager.notDoingAnything() &&
        readArray[readArray.length - 1] == null) {
      // calculate final hash...
      var ed2k_hash = md4.create();
      if ((ed2k_nullend && f.size >= 9728000) ||
        (!ed2k_nullend && f.size > 9728000)) {
        // file is more than one chunk, no special bullshit necessary
        for (var i = 0, chunkhash; chunkhash = file_md4[i]; i++) {
          ed2k_hash.update(file_md4[i]);
        }
        ed2k_hash = ed2k_hash.hex();
      } else {
        // file is less than 9728000 in nullend mode OR
        // file is less than 9728001 in non-nullend mode
        ed2k_hash = arrayBufferToHexDigest(file_md4[0]);
      }
      //console.log('process_files: ed2k_hash=', ed2k_hash);
      //console.log('process_files: finished', f.name);
      (func_finish && setTimeout(func_finish, 1, f, ed2k_hash));
      f = null;
      return;
    }

    //setTimeout(processFiles, 250);
  }

  function whatsHappening() {
    var tmp_availablechunks = fakeread_i.length;
    var tmp_fakeread_i = fakeread_i[0];

    if (!f)
      return;

    //console.log('chunk availability ' + tmp_availablechunks + '/' + chunkQueue);

    if (work_manager.workerNotAvailable()) {
      //console.log('  waiting for worker to finish...');
      return;
    }

    if (chunkQueue <= 0 || readArray[tmp_fakeread_i] == null) {
      //console.log('  waiting for chunks to be available..');
      return;
    }

    //console.log('actual_queue_length=', chunkQueue, 'array=', readArray);
    //console.log('"reading" ' + tmp_fakeread_i);

    while (work_manager.workerAvailable() &&
        (chunkQueue > 0 && readArray[tmp_fakeread_i] != null)) {
      if (readArray[tmp_fakeread_i].byteLength == 0 && !ed2k_nullend) {
        fakeread_i.shift();
        delete readArray[tmp_fakeread_i];
        tmp_fakeread_i = fakeread_i[0];
        chunkQueue -= 1;
        continue;
      }

      if (window.Worker) {
        work_manager.dispatchWork({'index': tmp_fakeread_i,
                            'data': readArray[tmp_fakeread_i]});
      } else {
        // dumb mode
        file_md4[tmp_fakeread_i] = md4.arrayBuffer(readArray[tmp_fakeread_i]);
      }
      (func_progress && setTimeout(func_progress, 1, f,
        Math.round(++comp_chunks*comp_multiplier))
      );
      fakeread_i.shift();
      delete readArray[tmp_fakeread_i];
      tmp_fakeread_i = fakeread_i[0];
      chunkQueue -= 1;
    }

    setTimeout(processFiles, 0);
  }

  function workManager() {
    const max_workers = 2;
    var worker = [];
    var available_workers = [];

    for (var i = 0; i < max_workers; i++) {
      worker[i] = new Worker('md4-worker.js');
      worker[i].onmessage = function(e) {
        file_md4[e.data.index] = e.data.md4;

        available_workers.push(e.data.workerid);
        setTimeout(whatsHappening, 0);
        setTimeout(processFiles, 0);
        //console.log('workManager: worker' + e.data.workerid +
        //            ': finished index ' + e.data.index);
      };
      available_workers.push(i);
      console.log('workManager: created worker' + i);
    }

    this.dispatchWork = (function(e) {
      if (this.workerNotAvailable())
        return;

      var workerid = available_workers.shift();
      worker[workerid].postMessage({'workerid': workerid, 'index': e.index,
          'data': e.data}, [e.data]);
    });

    this.workerAvailable = (function() {
      return available_workers.length != 0;
    });

    this.workerNotAvailable = (function() {
      return available_workers.length == 0;
    });

    this.notDoingAnything = (function() {
      return available_workers.length == max_workers;
    });
  }

  function arrayBufferToHexDigest(arr) {
    // taken from js-md4
    var HEX_CHARS = '0123456789abcdef'.split('');
    var blocks = new Uint32Array(arr);
    var h0 = blocks[0], h1 = blocks[1], h2 = blocks[2], h3 = blocks[3];

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
    HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F];
  }
});

var ed2k_files = ed2k_files || (function(files, ed2k_nullend, func_progress, func_finish) {
  "use strict";

  var fileOffset = 0;
  var ed2k_nullend = ed2k_nullend && true;
  var f = files[fileOffset++];
  var before;

  var ed2k_chunk_processed = function(_file, _progress) {
    //console.log('completeness name=' + _file.name + ' ' + _progress + '%');
    (func_progress) && setTimeout(func_progress, 1, _file, _progress);
  }

  var ed2k_file_finished = function(_file, _ed2k_hash) {
    f = files[fileOffset++];
    (func_finish) && setTimeout(func_finish, 1, _file, _ed2k_hash);

    if (f) {
      // proceed to next file
      ed2k_file(f, ed2k_nullend, ed2k_chunk_processed, ed2k_file_finished);
    } else {
      console.log('process_files: all files processed. took ' +
        (Date.now()-before) + 'ms.');
      return;
    }
  }

  if (!f)
    return;

  console.log('ed2k_files: nullend mode is ' +
    (ed2k_nullend && 'enabled' || 'disabled'));

  (window.Worker) || window.alert('Browser does not support HTML5 Web Workers. Please upgrade.\n\nPerformance and browser interactivity will be affected.');

  before = Date.now();
  ed2k_file(f, ed2k_nullend, ed2k_chunk_processed, ed2k_file_finished);
});
  