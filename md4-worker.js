importScripts('external/js-md4/src/md4.js');

onmessage = function(e) {
  var result;
  result = md4.arrayBuffer(e.data.data);
  postMessage({'index': e.data.index, 'md4': result}, [result]);
  delete e.data.data;
}
