importScripts('external/js-md4/src/md4.js');

self.onmessage = function(e) {
  var result = md4.arrayBuffer(e.data.data);
  postMessage({'workerid': e.data.workerid, 'index': e.data.index,
    'md4': result, 'dirty': e.data.data}, [result, e.data.data]);
}
