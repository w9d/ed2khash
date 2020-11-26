/* global goog */
goog.module('ed2khash.torrent_parse')
const Bencode = goog.require('benjreinhart.bencodejs')
goog.require('goog.dom')
goog.require('goog.crypt')
goog.require('goog.crypt.Sha1')
//goog.require('goog.crypt.Sha256')

var undefined

class torrent_parse {
  /**
   * @param {!string} bin_string
   */
  constructor (bin_string) {
    this._version = undefined
    this._info_hash_v1 = undefined
    //this._info_hash_v2 = undefined
    this._size = undefined
    this._name = undefined
    if (!bin_string || typeof bin_string !== 'string')
      throw 'internal problem: I\'m not being used correctly'
    if (bin_string.length > 0x2000000)
      throw 'torrent over arbitrary limit of 32MiB'
    const torrent = Bencode.decode(bin_string)
    sanity_checks(bin_string, torrent)
    this._version = torrent['info']['meta version'] || 1

    this._name = torrent['info']['name']
    this._size = torrent_size(torrent)
    const sha1 = new goog.crypt.Sha1()
    sha1.update(Bencode.encode(torrent['info']))
    this._info_hash_v1 = goog.crypt.byteArrayToHex(sha1.digest())
    //if (this._version === 1)
    //  return
    //const sha256 = new goog.crypt.Sha256()
    //sha256.update(Bencode.encode(torrent['info']))
    //this._info_hash_v2 = goog.crypt.byteArrayToHex(sha256.digest().slice(0, 20))
  }
  info_hash () {
    if (!this._info_hash_v1)
      throw 'no'
    if (this._version === 1)
      return this._info_hash_v1
    //else if (this._version === 2)
    //  return this._info_hash_v2
  }
  info_hash_v1 () {
    if (!this._info_hash_v1)
      throw 'no'
    return this._info_hash_v1
  }
  //info_hash_v2() {
  //  if (!this._info_hash_v1)
  //    throw 'no'
  //  return this._info_hash_v2
  //}
  size () {
    if (!this._info_hash_v1)
      throw 'no'
    return this._size
  }
  name () {
    if (!this._info_hash_v1)
      throw 'no'
    return this._name
  }
}

function sanity_checks (orig_torrent_str, torrent) {
  if (typeof orig_torrent_str !== 'string' || typeof torrent !== 'object')
    throw 'this should never happen'
  if (orig_torrent_str !== Bencode.encode(torrent))
    throw 'torrent formatted strange, unordered or javascript mangled it'
  if (!torrent['announce'] || !torrent['info'])
    throw 'torrent missing announce or info keys'
  const version = torrent['info']['meta version'] || 1
  if (typeof version !== 'number')
    throw 'torrent meta version NaN'
  const piece_length = torrent['info']['piece length']
  if ((!piece_length || typeof piece_length !== 'number' ||
      Math.log2(piece_length) !== Math.floor(Math.log2(piece_length))) ||
      (version === 2 && piece_length < 16384))
    throw 'torrent piece length validation failed'
  if (!torrent['info']['name'] || typeof torrent['info']['name'] !== 'string')
    throw 'torrent: has no name'
  if (version === 1) {
    const pieces = torrent['info']['pieces']
    if (!pieces || typeof pieces !== 'string' || pieces.length === 0 ||
        pieces.length / 20 % 1 !== 0)
      throw 'torrent pieces validation failed'
    if (!(!!torrent['info']['length'] ^ !!torrent['info']['files']))
      throw 'torrent not single or multi?!'
    if (torrent['info']['length']) {
      // single torrent
      if (typeof torrent['info']['length'] !== 'number' ||
          !(torrent['info']['length'] >= 0 && torrent['info']['length'] <= Number.MAX_SAFE_INTEGER))
        throw 'torrent: single, has bad length'
    }
    if (torrent['info']['files']) {
      // multi file torrent
      const valid_structure = torrent['info']['files'].map(a =>
        a['length'] && typeof a['length'] === 'number' &&
        a['length'] >= 0 && a['length'] <= Number.MAX_SAFE_INTEGER &&
        a['path'] && Array.isArray(a['path'])
      ).reduce((a, b) => a && b)
      // XXX: path stored by Bencodejs as Array object?!
      if (!valid_structure)
        throw 'torrent: multi, has invalid files structure'
    }
  } else if (version === 2) {
    throw 'bittorrent2: not tested or complete'
    //if (!torrent['piece layers'] || !torrent['meta version'] ||
    //    !torrent['info']['file tree'])
    //  throw 'bittorrent2: missing field'
  } else {
    throw 'bittorrent meta version is unsupported'
  }
}

function torrent_size (torrent) {
  return torrent['info']['files'] ? (torrent['info']['files'].map(a=>a.length).reduce((a, b) => a + b)) : torrent['info']['length']
}

exports = torrent_parse
