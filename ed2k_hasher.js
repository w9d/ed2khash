
var ed2k_file = ed2k_file || (function(f, func_progress, func_finish, opts) {
  "use strict";

  var readArray = [];
  var readOffset = 0;
  var readOffset_i = 0;
  var chunkQueue = 0;
  var fakeread_i = [];
  const using_workers = (window.Worker &&
                         typeof ED2K_NODE_ENVIRON === 'undefined');
  var work_manager = new workManager();

  var file_md4 = new Array();
  var comp_chunks = 0;
  var ed2k_nullend = opts.nullend;
  var comp_multiplier = 100 / (Math.ceil(f.size / 9728000));
  var delay = {'read': [], 'queuewait': [], 'workerwait': []};
  var read_size = opts.chunksperread * 9728000;
  var fill_queue = true;

  console.log('process_files: starting', f.name);
  setTimeout(giveMeChunks, 0);

  /* giveMeChunks: Slice file (f) into 9728000 byte chunks and asyncronously
   * read it into readArray. readArray can be accessed at any index listed in
   * the fakeread_i array.
   *
   * This function is executed above at ed2k_file load and after a successful
   * job dispatch from giveWorkersWork.
   */
  function giveMeChunks() {
    if (!f)
      return;

    if (chunkQueue <= opts.readatlength)
      fill_queue = true;

    while (chunkQueue < opts.queuelength && fill_queue &&
        readOffset < f.size) {
      var file = new window.FileReader();

      console.log('process_files: name=', f.name, 'offset=', readOffset, '/', f.size);

      file.readAsArrayBuffer(f.slice(readOffset, readOffset + read_size));
      delay.read[readOffset_i] = Date.now();

      let tmp_readOffset_i = readOffset_i;
      file.addEventListener('loadend',
        function(evt) {
          delay.read[tmp_readOffset_i] = Date.now() - delay.read[tmp_readOffset_i];

          for (var chunk, off_s = 0, off_e = 9728000, i = 0;
               ((chunk = evt.target.result.slice(off_s, off_e)) || true) &&
               off_s < evt.target.result.byteLength;
               i++, off_s = off_e, off_e += 9728000) {
            var real_offset = tmp_readOffset_i + i;
            //console.log('HIT LOOP', real_offset, i, off_s, off_e, chunk);

            readArray[real_offset] = chunk;
            fakeread_i.push(real_offset);
            delay.queuewait[real_offset] = Date.now();
          }
          if (evt.target.result.byteLength < read_size) {
            // when reading multiple chunks we need to correct the chunkQueue
            // length at the end since we assumed it'd increase by chunksperread
            var bytes_remove = read_size - evt.target.result.byteLength;
            var chunks_remove = Math.floor(bytes_remove / 9728000);
            if (chunks_remove > 0)
              chunkQueue -= chunks_remove;
          }
          // there may be no workers available, so we're dependent on workers
          // calling the work dispatcher for us.
          work_manager.workerAvailable() && setTimeout(giveWorkersWork, 0);
        }, false
      );

      readOffset += read_size;
      readOffset_i += opts.chunksperread;
      chunkQueue += opts.chunksperread;
    }

    fill_queue = false;
  }

  /* areWeThereYet: Checks to see if we are finished.
   *
   * This function is executed by every web worker callback.
   */
  function areWeThereYet() {
    var read_delay = 0, queuewait_delay = 0, workerwait_delay = 0;

    if (!f)
      return;

    if (chunkQueue <= 0 && readOffset >= f.size &&
        work_manager.notDoingAnything() &&
        fakeread_i[0] == null) {
      // calculate final hash...
      var ed2k_hash = md4.create();
      if ((ed2k_nullend && f.size >= 9728000) ||
        (!ed2k_nullend && f.size > 9728000)) {
        if ((f.size % 9728000) == 0 && f.size > 0 && ed2k_nullend)
          file_md4.push(md4.arrayBuffer(new ArrayBuffer(0)));
        for (var i = 0, chunkhash; chunkhash = file_md4[i]; i++) {
          ed2k_hash.update(file_md4[i]);
        }
        ed2k_hash = ed2k_hash.hex();
      } else {
        // file is less than 9728000 in nullend mode OR
        // file is less than 9728001 in non-nullend mode
        ed2k_hash = arrayBufferToHexDigest(file_md4[0]);
      }
      for (var i = 0; i < delay.read.length; i++) {
        read_delay += delay.read[i] && delay.read[i] || 0;
        queuewait_delay += delay.queuewait[i];
        workerwait_delay += delay.workerwait[i] && delay.workerwait[i] || 0;
      }
      //console.log('process_files: ed2k_hash=', ed2k_hash);
      //console.log('process_files: finished', f.name);
      console.log('delays: ' + read_delay + 'ms (FileReader)' +
          ', ' + queuewait_delay + 'ms (worker availability)' +
          ' and ' + workerwait_delay + 'ms (worker callbacks)');

      console.log('delays (FileReader): ' + delay.read);
      console.log('delays (worker ava): ' + delay.queuewait);
      console.log('delays (worker call):' + delay.workerwait);

      (func_finish && setTimeout(func_finish, 1, f, ed2k_hash));

      work_manager.terminateWorkers();
      f = null;
      return;
    }
  }

  /* giveWorkersWork: If workers are available, tell them to do something.
   *
   * This function is executed by each FileReader loadend callback and by every
   * web worker callback.
   *
   * TODO: Allay my fears that upon slowdown this callback convention may stop
   * working.
   */
  function giveWorkersWork() {
    var tmp_fakeread_i = fakeread_i[0];

    if (!f)
      return;

    //console.log('chunk availability ' + fakeread_i.length + '/' + chunkQueue);

    if (work_manager.workerNotAvailable()) {
      //console.log('  waiting for worker to finish...');
      return;
    }

    if (chunkQueue <= 0 || readArray[tmp_fakeread_i] == null) {
      console.log(' queue starvation, worker(s) available but we have nothing to give them');
      return;
    }

    //console.log('actual_queue_length=', chunkQueue, 'array=', readArray);
    //console.log('"reading" ' + tmp_fakeread_i);

    while (work_manager.workerAvailable() &&
        (chunkQueue > 0 && readArray[tmp_fakeread_i] != null)) {

      if (using_workers) {
        work_manager.dispatchWork({'index': tmp_fakeread_i,
                            'data': readArray[tmp_fakeread_i]});
      } else {
        // dumb mode
        delay.queuewait[tmp_fakeread_i] = Date.now() - delay.queuewait[tmp_fakeread_i];
        file_md4[tmp_fakeread_i] = md4.arrayBuffer(readArray[tmp_fakeread_i]);
        setTimeout(areWeThereYet, 0);
      }
      (func_progress && setTimeout(func_progress, 1, f,
        Math.round(++comp_chunks*comp_multiplier))
      );
      fakeread_i.shift();
      readArray[tmp_fakeread_i] = null;
      delete readArray[tmp_fakeread_i];
      tmp_fakeread_i = fakeread_i[0];
      chunkQueue -= 1;
    }

    // we have consumed some chunks. want more.
    setTimeout(giveMeChunks, 0);
  }

  function workManager() {
    const compute_capacity = (navigator.hardwareConcurrency || 2);
    const max_workers = (compute_capacity <= 3) && compute_capacity || 3;
    var worker = [];
    var available_workers = [];

    this.dispatchWork = (function(e) {
      if (this.workerNotAvailable())
        return;

      delay.queuewait[e.index] = Date.now() - delay.queuewait[e.index];
      delay.workerwait[e.index] = Date.now();
      var workerid = available_workers.shift();
      worker[workerid].postMessage({'workerid': workerid, 'index': e.index,
          'data': e.data}, [e.data]);
    });

    this.terminateWorkers = (function() {
      for (var i = 0; i < worker.length; i++) {
        worker[i].terminate();
      }
      worker = [];
      available_workers = [];
    });

    this.workerAvailable = (function() {
      return available_workers.length != 0 || !using_workers;
    });

    this.workerNotAvailable = (function() {
      return available_workers.length == 0 && using_workers;
    });

    this.notDoingAnything = (function() {
      return available_workers.length == max_workers || !using_workers;
    });

    if (!using_workers)
      return;

    for (var i = 0; i < max_workers; i++) {
      worker[i] = new window.Worker('md4-worker.js');
      worker[i].onmessage = function(e) {
        file_md4[e.data.index] = e.data.md4;

        available_workers.push(e.data.workerid);
        delay.workerwait[e.data.index] = Date.now() - delay.workerwait[e.data.index];

        e.data.dirty = null;
        delete e.data.dirty;
        setTimeout(giveWorkersWork, 0); // worker is available. give us a job.
        setTimeout(areWeThereYet, 0); // are we there yet?
        //console.log('workManager: worker' + e.data.workerid +
        //            ': finished index ' + e.data.index);
      };
      available_workers.push(i);
      console.log('workManager: created worker' + i);
    }
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

var ed2k_files = ed2k_files || (function(files, func_progress, func_finish, opts) {
  "use strict";

  var fileOffset = 0;
  var opts = opts || {};
  (opts.nullend === undefined) && (opts.nullend = true);

  var f = files[fileOffset++];
  var before;

  if (opts.queuelength === undefined) {
    opts.queuelength = 6;
  }

  if (opts.chunksperread === undefined) {
    opts.chunksperread = 1;
  } else {
    // is opts.chunksperread a multiple of opts.queuelength?
  }

  if (opts.readatlength === undefined) {
    opts.readatlength = 3;
  } else {
    // is opts.readatlength < opts.queuelength?
    // is opts.readatlength a multiple of opts.queuelength?
  }

  var ed2k_chunk_processed = function(_file, _progress) {
    //console.log('completeness name=' + _file.name + ' ' + _progress + '%');
    (func_progress) && func_progress(_file, _progress);
  }

  var ed2k_file_finished = function(_file, _ed2k_hash) {
    f = files[fileOffset++];
    (func_finish) && func_finish(_file, _ed2k_hash);

    if (f) {
      // proceed to next file
      ed2k_file(f, ed2k_chunk_processed, ed2k_file_finished, opts);
    } else {
      console.log('process_files: all files processed. took ' +
        (Date.now()-before) + 'ms.');
      return;
    }
  }

  if (!f)
    return;

  console.log('ed2k_files: nullend mode is ' +
    (opts.nullend && 'enabled' || 'disabled'));

  (window.Worker) || window.alert('Browser does not support HTML5 Web Workers. Please upgrade.\n\nPerformance and browser interactivity will be affected.');

  before = Date.now();
  ed2k_file(f, ed2k_chunk_processed, ed2k_file_finished, opts);
});

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
