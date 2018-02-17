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
    result.type = this.type;
    result._start = start;
    result._end = (end > this.size) && this.size || end;
    result.size = result._end - result._start;
    result._orig_size = this.size;
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
  var _callbacks = { 'loadend': []};
  var prop = {
    readAsArrayBuffer: readAsArrayBuffer,
    addEventListener: addEventListener,
    onloadend: null
  };

  function readAsArrayBuffer(mockfile) {
    var evt = {};
    evt.target = {};
    evt.target.result = mockfile._genFunc(mockfile._start, mockfile._end, mockfile._orig_size);

    var deferred_callbacks = (function () {
      for (var i = 0; i < _callbacks['loadend'].length; i++) {
        _callbacks['loadend'][i](evt);
      }
      (prop.onloadend) && (prop.onloadend(evt));
    });

    setTimeout(deferred_callbacks, 20);
  }
  function addEventListener(event, fn, useCapture) {
    if (_callbacks[event] == undefined) {
      _callbacks[event] = [];
      _events.push(event);
    }

    _callbacks[event].push(fn);
  }

  return prop;
});

module.exports = {
  genZero: genZero,
  MockFile: MockFile,
  MockFileReader: MockFileReader
};

