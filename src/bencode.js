/* eslint-disable */
goog.module('benjreinhart.bencodejs');
// https://github.com/benjreinhart/bencode-js
exports = Bencode
function Bencode() {}

var read;
read = function (str) {
  var arr, bencoded, cache$, cache$1, cursor, key, keyLength, obj, startPos, stringLength, value, valueLength;
  switch (str[0]) {
  case 'i':
    bencoded = str.match(/^i-?\d+e/)[0];
    return [
      bencoded.length,
      +bencoded.slice(1, -1)
    ];
  case '0':
  case '1':
  case '2':
  case '3':
  case '4':
  case '5':
  case '6':
  case '7':
  case '8':
  case '9':
    stringLength = str.match(/^\d+/)[0];
    startPos = stringLength.length + 1;
    bencoded = str.slice(0, startPos + +stringLength);
    return [
      bencoded.length,
      bencoded.slice(startPos)
    ];
  case 'l':
    cursor = 1;
    arr = function (accum$) {
      var cache$, entry, entryLength;
      while (str[cursor] !== 'e') {
        cache$ = read(str.slice(cursor));
        entryLength = cache$[0];
        entry = cache$[1];
        cursor += entryLength;
        accum$.push(entry);
      }
      return accum$;
    }.call(this, []);
    return [
      cursor + 1,
      arr
    ];
  case 'd':
    cursor = 1;
    obj = {};
    while (str[cursor] !== 'e') {
      cache$ = read(str.slice(cursor));
      keyLength = cache$[0];
      key = cache$[1];
      cache$1 = read(str.slice(cursor + keyLength));
      valueLength = cache$1[0];
      value = cache$1[1];
      cursor += keyLength + valueLength;
      obj[key] = value;
    }
    return [
      cursor + 1,
      obj
    ];
  }
};
//module.exports = function (str) {
//  return read(str)[1];
//};
Bencode.decode = function (str) {
  return read(str)[1];
};

var encode, encodeDictionary, encodeInteger, encodeList, encodeString;
encodeString = function (s) {
  return '' + s.length + ':' + s;
};
encodeInteger = function (i) {
  return 'i' + i + 'e';
};
encodeList = function (array) {
  var encodedContents, object;
  encodedContents = function (accum$) {
    for (var i$ = 0, length$ = array.length; i$ < length$; ++i$) {
      object = array[i$];
      accum$.push(encode(object));
    }
    return accum$;
  }.call(this, []).join('');
  return 'l' + encodedContents + 'e';
};
encodeDictionary = function (object) {
  var encodedContents, key, keys;
  keys = function (accum$) {
    for (key in object) {
      if (!isOwn$(object, key))
        continue;
      accum$.push(key);
    }
    return accum$;
  }.call(this, []).sort();
  encodedContents = function (accum$1) {
    for (var i$ = 0, length$ = keys.length; i$ < length$; ++i$) {
      key = keys[i$];
      accum$1.push('' + encode(key) + encode(object[key]));
    }
    return accum$1;
  }.call(this, []).join('');
  return 'd' + encodedContents + 'e';
};
encode = function (object) {
  switch (false) {
  case !(typeof object === 'string'):
    return encodeString(object);
  case !(typeof object === 'number'):
    return encodeInteger(Math.floor(object));
  case !('[object Array]' === {}.toString.call(object)):
    return encodeList(object);
  default:
    return encodeDictionary(object);
  }
};
//module.exports = encode;
Bencode.encode = encode;
function isOwn$(o, p) {
  return {}.hasOwnProperty.call(o, p);
}
