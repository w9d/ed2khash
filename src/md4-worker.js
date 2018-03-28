/* eslint-env browser */
/* global importScripts */
/* global md4 */

goog.provide('ti.ed2khash.worker')
goog.require('emn178.jsmd4')

/***
 * f = finish status
 * d = ArrayBuffer of input data to hash
 * hl = Hash list of MD4 ArrayBuffers with which to create ED2K hash
 * i = index of input, pass back to maintain order
 * h = result MD4 ArrayBuffer to pass back
 */

self.onmessage = function (e) {
  if (!e.data['f']) {
    var inputData = e.data['d']
    var result = md4.arrayBuffer(inputData)
    postMessage({'i': e.data['i'], 'h': result, 'd': inputData}, [result, inputData])
  } else {
    var hashList = e.data['hl']
    var ed2k = md4.create()
    for (var i = 0, chunkhash; (chunkhash = hashList[i]); i++)
      ed2k.update(chunkhash)
    ed2k = ed2k.arrayBuffer()
    postMessage({'h': ed2k}, [ed2k])
  }
}
