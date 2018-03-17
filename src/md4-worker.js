importScripts('md4.js')

self.onmessage = function(e) {
  if (!e.data.finish) {
    var result = md4.arrayBuffer(e.data.data)
    postMessage({'workerid': e.data.workerid, 'index': e.data.index,
      'md4': result, 'dirty': e.data.data}, [result, e.data.data])
  } else {
    var result = md4.create()
    for (var i = 0, chunkhash; chunkhash = e.data.md4_list[i]; i++) {
      result.update(chunkhash)
    }
    result = result.arrayBuffer()
    postMessage({'ed2khash': result}, [result])
  }
}
