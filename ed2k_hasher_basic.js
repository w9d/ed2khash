var ed2k_files = (function(files, opts) {
'use strict';
  var reader = new window.FileReader();
  var prop = { onprogress: null, onfilecomplete: null, onallcomplete: null,
    execute: execute };
  var opts = (opts === undefined && {} || opts);
  (opts.nullend === undefined) && (opts.nullend = true);

  function ed2k_file(file, offset, running_hash) {
    'use strict';
    if (typeof offset !== 'number') {
      offset = 0;
      running_hash = md4.create();
    }

    reader.onloadend = function(evt) {
      running_hash.update(md4.arrayBuffer(evt.target.result));
      ed2k_file(file, offset+9728000, running_hash);
    }

    if (offset < file.size) {
      reader.readAsArrayBuffer(file.slice(offset, offset+9728000));
    } else {
      if ((opts.nullend && file.size >= 9728000) ||
          (!opts.nullend && file.size > 9728000)) {
        // insert nullend if neccessary
        if ((file.size % 9728000) == 0 && file.size > 0 && opts.nullend)
          running_hash.update(new ArrayBuffer(0));

        (prop.onfilecomplete) && prop.onfilecomplete(file, running_hash.hex());
      } else {
        (prop.onfilecomplete) && prop.onfilecomplete(file,
            arrayBufferToHexDigest(running_hash));
      }
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

  function execute() {
    for (var i = 0; i<files.length; i++) {
      ed2k_file(files[i], undefined, undefined);
    }
  }

  return prop;
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
