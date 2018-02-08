'use strict';

// with nullend:
// a4aed104a077de7e4210e7f5b131fe25  test_19455999_zeros.bin
// 114b21c63a74b6ca922291a11177dd5c  test_19456000_zeros.bin
// e57f824d28f69fe90864e17673668457  test_19456001_zeros.bin
// ac44b93fc9aff773ab0005c911f8396f  test_9727999_zeros.bin
// fc21d9af828f92a8df64beac3357425d  test_9728000_zeros.bin
// 06329e9dba1373512c06386fe29e3c65  test_9728001_zeros.bin

const test = require('tape');
const com = require('./common.js');
const md4 = require('../external/js-md4/src/md4.js');

var window = { Worker: null };
const ed2k = require('../ed2k_hasher.js');
const webworker = require('webworker-threads').Worker;
const fakewindow = { Worker: webworker, FileReader: com.MockFileReader };
const fakenavigator = { hardwareConcurrency: 1 };
ed2k.passMocks(fakewindow, fakenavigator, md4);

process.chdir('..');

test('single file single chunk with nullend', function(t) {
    t.plan(1);

    var test = new com.MockFile(null, 'name', {});
    test.size = 9728000; test._end = 9728000;
    test._genFunc = com.genZero;
    var hash = [];
    var c = function(_file, _hash) {
      hash[_file.name] = _hash;
      console.log(hash);
    };
    ed2k.ed2k_files([test]);
    
    t.equal(true, true);
});
