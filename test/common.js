'use strict';

var genZero = function(start, end, size) {
  (end > size) && (end = size);
  (start > end) && (start = end);

  var buffer = new Uint8Array(end - start);
  return buffer.buffer;
}

var MockFile = (function(bits_noop, name, opts) {
  (opts) || (opts = {});
  this.name = name;
  this.lastModified = (opts.lastModified) || Date.now();
  this.size = 0;
  this.type = (opts.type) || 'video/mp4';
  this._start = 0;
  this._end = this.size;
  this._genFunc = null;

  this.slice = (function(start, end, contentType) {
    var options = {};
    var result = new MockFile(null, this.name, options);
    result.lastModified = this.lastModified;
    // TODO: result._end - result._start; might need secret size for _genFunc
    result.size = this.size;
    result.type = this.type;
    result._start = start;
    result._end = (end > this.size) && this.size || end;
    result._genFunc = this._genFunc;

    return result;
  });

  this._test = (function(fn, size) {
    var result = this;
    result.name = 'test.ts';
    result.size = size;
    result._end = size;
    result._genFunc = fn;

    return result;
  });
});

var MockFileReader = (function() {
  var _events = [];
  var _callbacks = {};
  
  this.readAsArrayBuffer = (function (mockfile) {
    var evt = {};
    evt.target = {};
    evt.target.result = mockfile._genFunc(mockfile._start, mockfile._end, mockfile.size);

    var deferred_callbacks = (function () {
      for (var i = 0; i < _callbacks['loadend'].length; i++) {
        _callbacks['loadend'][i](evt);
      }
    });

    setTimeout(deferred_callbacks, 20);
  });
  this.addEventListener = (function(event, fn, useCapture) {
    if (_callbacks[event] == undefined) {
      _callbacks[event] = [];
      _events.push(event);
    }

    _callbacks[event].push(fn);
  });
});

module.exports = {
  genZero: genZero,
  MockFile: MockFile,
  MockFileReader: MockFileReader
};

