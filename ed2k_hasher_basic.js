var ed2k_files = (function(files, opts) {
'use strict';
  var reader = new window.FileReader();
  var prop = { onprogress: null, onfilecomplete: null, onallcomplete: null,
    execute: execute };
  var opts = (opts === undefined && {} || opts);

  function ed2k_file(file, offset, md4_list) {
    'use strict';
    if (typeof offset !== 'number') {
      offset = 0;
      md4_list = [];
    }

    reader.onloadend = function(evt) {
      md4_list.push(md4.arrayBuffer(evt.target.result));
      ed2k_file(file, offset+9728000, md4_list);
    }

    if (offset <= file.size) {
      reader.readAsArrayBuffer(file.slice(offset, offset+9728000));
    } else {
      var ed2k_hash = md4.create();
      if (file.size >= 9728000) {
        // calculate final hash...
        for (var i = 0, chunkhash; chunkhash = md4_list[i]; i++) {
          ed2k_hash.update(chunkhash);
        }

        (prop.onfilecomplete) && prop.onfilecomplete(file, ed2k_hash.hex());
      } else {
        (prop.onfilecomplete) && prop.onfilecomplete(file,
            arrayBufferToHexDigest(md4_list[0]));
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
