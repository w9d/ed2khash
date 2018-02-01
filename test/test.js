'use strict';

//import md4 from "../external/js-md4/src/md4";
//const md4 = require("../external/js-md4/src/md4");
const md4 = require("../external/js-md4/build/md4.min");

function generateZeroData(start, end, size) {
  if (end > size)
    end = size;

  let buffer = new Uint8Array(end - start);

  return buffer.buffer;
}

function generateIncData(start, end, size) {
  if (end > size)
    end = size;

  let buffer = new Uint8Array(end - start);

  for (let i = 0; i < end; i++) {
    buffer[i] = i + start;
  }

  return buffer.buffer;
}

var File = function(fn, size) {
  // fn needs a ArrayBuffer generator function
  this.generatorfn = fn;
  this.size = size;
}
File.prototype.slice = function(s, e) {
  return { 'arraybuffer': this.generatorfn(s, e, this.size) }
}

var FileReader = function() {
  this.callback = [];
}
FileReader.prototype.JUSTDOIT = function(name, file, othis) {
  let evt = []
  evt['target'] = []
  evt['target']['result'] = file.arraybuffer;
  //console.log('EXECUTING CALLBACKS: name=', name, 'file=', file, 'this.callback=', othis.callback);

  var functions = othis.callback['event_' + name];

  if (Object.prototype.toString.call(evt.target.result) !== "[object ArrayBuffer]" ||
      functions === undefined)
    return;

  for (let i = 0; i < functions.length; i++) {
    functions[i](evt);
  }
}
FileReader.prototype.readAsArrayBuffer = function(file) {
  setTimeout(this.JUSTDOIT, 10, 'loadend', file, this);
}
FileReader.prototype.addEventListener = function(event, fn, useCapture) {
  if (this.callback['event_' + event] == undefined)
    this.callback['event_' + event] = [];

  this.callback['event_' + event].push(fn);
}

let file = new File(generateZeroData, 190456000);
let mockfilelist = [];
mockfilelist.push(file);

var timings = [];
var total = 0, min = 60000, max = 0;

let reader = new FileReader();
for (let i = 0; i < file.size; i += 9728000) {
  //console.log('read',i,'to',i+9728000);
  reader.readAsArrayBuffer(file.slice(i, i + 9728000));
  //console.log('finished read');
}
reader.addEventListener('loadend',
  function(evt) {
    //console.log('callback', evt.target.result.byteLength)
    //var test = new Uint8Array(evt.target.result);

    var before = Date.now();
    md4.hex(evt.target.result);
    var after = Date.now();
    var diff = after - before;
    timings.push(diff);

    if (diff < min)
        min = diff;
    if (diff > max)
        max = diff;
    total += diff;

    //console.log("MD4 calculation time...");
    console.log('md4 min/avg/max = ' + min + '/' + Math.floor((total/timings.length)+0.5) + '/' + max);

  }, false
);

