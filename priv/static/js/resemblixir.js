(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;require.register("fs", function(exports, require, module) {
  module.exports = {};
});
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};

require.register("base64-js/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "base64-js");
  (function() {
    'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}
  })();
});

require.register("browser-resolve/empty.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "browser-resolve");
  (function() {
    
  })();
});

require.register("buffer/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "buffer");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    this.length = 0
    this.parent = undefined
  }

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(array)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
} else {
  // pre-set for values that may exist in the future
  Buffer.prototype.length = undefined
  Buffer.prototype.parent = undefined
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}
  })();
});

require.register("canvas/lib/bindings.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "canvas");
  (function() {
    'use strict';

module.exports = require('../build/Release/canvas.node');
  })();
});

require.register("canvas/lib/canvas.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "canvas");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    'use strict';

/*!
 * Canvas
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var canvas = require('./bindings')
  , Canvas = canvas.Canvas
  , Image = canvas.Image
  , cairoVersion = canvas.cairoVersion
  , Context2d = require('./context2d')
  , PNGStream = require('./pngstream')
  , PDFStream = require('./pdfstream')
  , JPEGStream = require('./jpegstream')
  , FontFace = canvas.FontFace
  , fs = require('fs')
  , packageJson = require("../package.json")
  , FORMATS = ['image/png', 'image/jpeg'];

/**
 * Export `Canvas` as the module.
 */

var Canvas = exports = module.exports = Canvas;

/**
 * Library version.
 */

exports.version = packageJson.version;

/**
 * Cairo version.
 */

exports.cairoVersion = cairoVersion;

/**
 * jpeglib version.
 */

if (canvas.jpegVersion) {
  exports.jpegVersion = canvas.jpegVersion;
}

/**
 * gif_lib version.
 */

if (canvas.gifVersion) {
  exports.gifVersion = canvas.gifVersion.replace(/[^.\d]/g, '');
}

/**
 * freetype version.
 */

if (canvas.freetypeVersion) {
  exports.freetypeVersion = canvas.freetypeVersion;
}

/**
 * Expose constructors.
 */

exports.Context2d = Context2d;
exports.PNGStream = PNGStream;
exports.PDFStream = PDFStream;
exports.JPEGStream = JPEGStream;
exports.Image = Image;
exports.ImageData = canvas.ImageData;

if (FontFace) {
  var Font = function Font(name, path, idx) {
    this.name = name;
    this._faces = {};

    this.addFace(path, 'normal', 'normal', idx);
  };

  Font.prototype.addFace = function(path, weight, style, idx) {
    style = style || 'normal';
    weight = weight || 'normal';

    var face = new FontFace(path, idx || 0);
    this._faces[weight + '-' + style] = face;
  };

  Font.prototype.getFace = function(weightStyle) {
    return this._faces[weightStyle] || this._faces['normal-normal'];
  };

  exports.Font = Font;
}

/**
 * Context2d implementation.
 */

require('./context2d');

/**
 * Image implementation.
 */

require('./image');

/**
 * Inspect canvas.
 *
 * @return {String}
 * @api public
 */

Canvas.prototype.inspect = function(){
  return '[Canvas ' + this.width + 'x' + this.height + ']';
};

/**
 * Get a context object.
 *
 * @param {String} contextId
 * @return {Context2d}
 * @api public
 */

Canvas.prototype.getContext = function(contextId){
  if ('2d' == contextId) {
    var ctx = this._context2d || (this._context2d = new Context2d(this));
    this.context = ctx;
    ctx.canvas = this;
    return ctx;
  }
};

/**
 * Create a `PNGStream` for `this` canvas.
 *
 * @return {PNGStream}
 * @api public
 */

Canvas.prototype.pngStream =
Canvas.prototype.createPNGStream = function(){
  return new PNGStream(this);
};

/**
 * Create a synchronous `PNGStream` for `this` canvas.
 *
 * @return {PNGStream}
 * @api public
 */

Canvas.prototype.syncPNGStream =
Canvas.prototype.createSyncPNGStream = function(){
  return new PNGStream(this, true);
};

/**
 * Create a `PDFStream` for `this` canvas.
 *
 * @return {PDFStream}
 * @api public
 */

Canvas.prototype.pdfStream =
Canvas.prototype.createPDFStream = function(){
  return new PDFStream(this);
};

/**
 * Create a synchronous `PDFStream` for `this` canvas.
 *
 * @return {PDFStream}
 * @api public
 */

Canvas.prototype.syncPDFStream =
Canvas.prototype.createSyncPDFStream = function(){
  return new PDFStream(this, true);
};

/**
 * Create a `JPEGStream` for `this` canvas.
 *
 * @param {Object} options
 * @return {JPEGStream}
 * @api public
 */

Canvas.prototype.jpegStream =
Canvas.prototype.createJPEGStream = function(options){
  return this.createSyncJPEGStream(options);
};

/**
 * Create a synchronous `JPEGStream` for `this` canvas.
 *
 * @param {Object} options
 * @return {JPEGStream}
 * @api public
 */

Canvas.prototype.syncJPEGStream =
Canvas.prototype.createSyncJPEGStream = function(options){
  options = options || {};
  // Don't allow the buffer size to exceed the size of the canvas (#674)
  var maxBufSize = this.width * this.height * 4;
  var clampedBufSize = Math.min(options.bufsize || 4096, maxBufSize);
  return new JPEGStream(this, {
      bufsize: clampedBufSize
    , quality: options.quality || 75
    , progressive: options.progressive || false
  });
};

/**
 * Return a data url. Pass a function for async support (required for "image/jpeg").
 *
 * @param {String} type, optional, one of "image/png" or "image/jpeg", defaults to "image/png"
 * @param {Object|Number} encoderOptions, optional, options for jpeg compression (see documentation for Canvas#jpegStream) or the JPEG encoding quality from 0 to 1.
 * @param {Function} fn, optional, callback for asynchronous operation. Required for type "image/jpeg".
 * @return {String} data URL if synchronous (callback omitted)
 * @api public
 */

Canvas.prototype.toDataURL = function(a1, a2, a3){
  // valid arg patterns (args -> [type, opts, fn]):
  // [] -> ['image/png', null, null]
  // [qual] -> ['image/png', null, null]
  // [undefined] -> ['image/png', null, null]
  // ['image/png'] -> ['image/png', null, null]
  // ['image/png', qual] -> ['image/png', null, null]
  // [fn] -> ['image/png', null, fn]
  // [type, fn] -> [type, null, fn]
  // [undefined, fn] -> ['image/png', null, fn]
  // ['image/png', qual, fn] -> ['image/png', null, fn]
  // ['image/jpeg', fn] -> ['image/jpeg', null, fn]
  // ['image/jpeg', opts, fn] -> ['image/jpeg', opts, fn]
  // ['image/jpeg', qual, fn] -> ['image/jpeg', {quality: qual}, fn]
  // ['image/jpeg', undefined, fn] -> ['image/jpeg', null, fn]

  var type = 'image/png';
  var opts = {};
  var fn;

  if ('function' === typeof a1) {
    fn = a1;
  } else {
    if ('string' === typeof a1 && FORMATS.indexOf(a1.toLowerCase()) !== -1) {
      type = a1.toLowerCase();
    }

    if ('function' === typeof a2) {
      fn = a2;
    } else {
      if ('object' === typeof a2) {
        opts = a2;
      } else if ('number' === typeof a2) {
        opts = {quality: Math.max(0, Math.min(1, a2)) * 100};
      }

      if ('function' === typeof a3) {
        fn = a3;
      } else if (undefined !== a3) {
        throw new TypeError(typeof a3 + ' is not a function');
      }
    }
  }

  if (this.width === 0 || this.height === 0) {
    // Per spec, if the bitmap has no pixels, return this string:
    var str = "data:,";
    if (fn) {
      setTimeout(function() {
        fn(null, str);
      });
    }
    return str;
  }

  if ('image/png' === type) {
    if (fn) {
      this.toBuffer(function(err, buf){
        if (err) return fn(err);
        fn(null, 'data:image/png;base64,' + buf.toString('base64'));
      });
    } else {
      return 'data:image/png;base64,' + this.toBuffer().toString('base64');
    }

  } else if ('image/jpeg' === type) {
    if (undefined === fn) {
      throw new Error('Missing required callback function for format "image/jpeg"');
    }

    var stream = this.jpegStream(opts);
    // note that jpegStream is synchronous
    var buffers = [];
    stream.on('data', function (chunk) {
      buffers.push(chunk);
    });
    stream.on('error', function (err) {
      fn(err);
    });
    stream.on('end', function() {
      var result = 'data:image/jpeg;base64,' + Buffer.concat(buffers).toString('base64');
      fn(null, result);
    });
  }
};
  })();
});

require.register("canvas/lib/context2d.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "canvas");
  (function() {
    'use strict';

/*!
 * Canvas - Context2d
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var canvas = require('./bindings')
  , Context2d = canvas.CanvasRenderingContext2d
  , CanvasGradient = canvas.CanvasGradient
  , CanvasPattern = canvas.CanvasPattern
  , ImageData = canvas.ImageData;

var parseCssFont = require('parse-css-font');

var unitsCss = require('units-css');

/**
 * Export `Context2d` as the module.
 */

var Context2d = exports = module.exports = Context2d;

/**
 * Cache color string RGBA values.
 */

var cache = {};

/**
 * Text baselines.
 */

var baselines = ['alphabetic', 'top', 'bottom', 'middle', 'ideographic', 'hanging'];

/**
 * Parse font `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

var parseFont = exports.parseFont = function(str) {
  var parsedFont;

  // Try to parse the font string using parse-css-font.
  // It will throw an exception if it fails.
  try {
    parsedFont = parseCssFont(str);
  }
  catch (e) {
    // Invalid
    return;
  }

  // Cached
  if (cache[str]) return cache[str];

  // Parse size into value and unit using units-css
  var size = unitsCss.parse(parsedFont.size);

  // TODO: dpi
  // TODO: remaining unit conversion
  switch (size.unit) {
    case 'pt':
      size.value /= .75;
      break;
    case 'in':
      size.value *= 96;
      break;
    case 'mm':
      size.value *= 96.0 / 25.4;
      break;
    case 'cm':
      size.value *= 96.0 / 2.54;
      break;
  }

  // Populate font object
  var font = {
    weight: parsedFont.weight,
    style: parsedFont.style,
    size: size.value,
    unit: size.unit,
    family: parsedFont.family[0]
  };

  return cache[str] = font;
};

/**
 * Enable or disable image smoothing.
 *
 * @api public
 */

Context2d.prototype.__defineSetter__('imageSmoothingEnabled', function(val){
  this._imageSmoothing = !! val;
  this.patternQuality = val ? 'best' : 'fast';
});

/**
 * Get image smoothing value.
 *
 * @api public
 */

Context2d.prototype.__defineGetter__('imageSmoothingEnabled', function(val){
  return !! this._imageSmoothing;
});

/**
 * Create a pattern from `Image` or `Canvas`.
 *
 * @param {Image|Canvas} image
 * @param {String} repetition
 * @return {CanvasPattern}
 * @api public
 */

Context2d.prototype.createPattern = function(image, repetition){
  // TODO Use repetition (currently always 'repeat')
  return new CanvasPattern(image);
};

/**
 * Create a linear gradient at the given point `(x0, y0)` and `(x1, y1)`.
 *
 * @param {Number} x0
 * @param {Number} y0
 * @param {Number} x1
 * @param {Number} y1
 * @return {CanvasGradient}
 * @api public
 */

Context2d.prototype.createLinearGradient = function(x0, y0, x1, y1){
  return new CanvasGradient(x0, y0, x1, y1);
};

/**
 * Create a radial gradient at the given point `(x0, y0)` and `(x1, y1)`
 * and radius `r0` and `r1`.
 *
 * @param {Number} x0
 * @param {Number} y0
 * @param {Number} r0
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} r1
 * @return {CanvasGradient}
 * @api public
 */

Context2d.prototype.createRadialGradient = function(x0, y0, r0, x1, y1, r1){
  return new CanvasGradient(x0, y0, r0, x1, y1, r1);
};

/**
 * Reset transform matrix to identity, then apply the given args.
 *
 * @param {...}
 * @api public
 */

Context2d.prototype.setTransform = function(){
  this.resetTransform();
  this.transform.apply(this, arguments);
};

/**
 * Set the fill style with the given css color string.
 *
 * @api public
 */

Context2d.prototype.__defineSetter__('fillStyle', function(val){
  if (!val) return;
  if ('CanvasGradient' == val.constructor.name
    || 'CanvasPattern' == val.constructor.name) {
    this.lastFillStyle = val;
    this._setFillPattern(val);
  } else if ('string' == typeof val) {
    this._setFillColor(val);
  }
});

/**
 * Get previous fill style.
 *
 * @return {CanvasGradient|String}
 * @api public
 */

Context2d.prototype.__defineGetter__('fillStyle', function(){
  return this.lastFillStyle || this.fillColor;
});

/**
 * Set the stroke style with the given css color string.
 *
 * @api public
 */

Context2d.prototype.__defineSetter__('strokeStyle', function(val){
  if (!val) return;
  if ('CanvasGradient' == val.constructor.name
    || 'CanvasPattern' == val.constructor.name) {
    this.lastStrokeStyle = val;
    this._setStrokePattern(val);
  } else if ('string' == typeof val) {
    this._setStrokeColor(val);
  }
});

/**
 * Get previous stroke style.
 *
 * @return {CanvasGradient|String}
 * @api public
 */

Context2d.prototype.__defineGetter__('strokeStyle', function(){
  return this.lastStrokeStyle || this.strokeColor;
});

/**
 * Register `font` for usage.
 *
 * @param {Font} font
 * @api public
 */

Context2d.prototype.addFont = function(font) {
  this._fonts = this._fonts || {};
  if (this._fonts[font.name]) return;
  this._fonts[font.name] = font;
};

/**
 * Set font.
 *
 * @see exports.parseFont()
 * @api public
 */

Context2d.prototype.__defineSetter__('font', function(val){
  if (!val) return;
  if ('string' == typeof val) {
    var font;
    if (font = parseFont(val)) {
      this.lastFontString = val;

      var fonts = this._fonts;
      if (fonts && fonts[font.family]) {
        var fontObj = fonts[font.family];
        var type = font.weight + '-' + font.style;

        var fontFace = fontObj.getFace(type);
        this._setFontFace(fontFace, font.size);
      } else {
        this._setFont(
            font.weight
          , font.style
          , font.size
          , font.unit
          , font.family);
      }
    }
  }
});

/**
 * Get the current font.
 *
 * @api public
 */

Context2d.prototype.__defineGetter__('font', function(){
  return this.lastFontString || '10px sans-serif';
});

/**
 * Set text baseline.
 *
 * @api public
 */

Context2d.prototype.__defineSetter__('textBaseline', function(val){
  if (!val) return;
  var n = baselines.indexOf(val);
  if (~n) {
    this.lastBaseline = val;
    this._setTextBaseline(n);
  }
});

/**
 * Get the current baseline setting.
 *
 * @api public
 */

Context2d.prototype.__defineGetter__('textBaseline', function(){
  return this.lastBaseline || 'alphabetic';
});

/**
 * Set text alignment.
 *
 * @api public
 */

Context2d.prototype.__defineSetter__('textAlign', function(val){
  switch (val) {
    case 'center':
      this._setTextAlignment(0);
      this.lastTextAlignment = val;
      break;
    case 'left':
    case 'start':
      this._setTextAlignment(-1);
      this.lastTextAlignment = val;
      break;
    case 'right':
    case 'end':
      this._setTextAlignment(1);
      this.lastTextAlignment = val;
      break;
  }
});

/**
 * Get the current font.
 *
 * @see exports.parseFont()
 * @api public
 */

Context2d.prototype.__defineGetter__('textAlign', function(){
  return this.lastTextAlignment || 'start';
});

/**
 * Create `ImageData` with the given dimensions or
 * `ImageData` instance for dimensions.
 *
 * @param {Number|ImageData} width
 * @param {Number} height
 * @return {ImageData}
 * @api public
 */

Context2d.prototype.createImageData = function(width, height){
  if ('ImageData' == width.constructor.name) {
    height = width.height;
    width = width.width;
  }
  return new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
};
  })();
});

require.register("canvas/lib/image.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "canvas");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    'use strict';

/*!
 * Canvas - Image
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Canvas = require('./bindings')
  , Image = Canvas.Image;

/**
 * Src setter.
 *
 *  - convert data uri to `Buffer`
 *
 * @param {String|Buffer} val filename, buffer, data uri
 * @api public
 */

Image.prototype.__defineSetter__('src', function(val){
  if ('string' == typeof val && 0 == val.indexOf('data:')) {
    val = val.slice(val.indexOf(',') + 1);
    this.source = new Buffer(val, 'base64');
  } else {
    this.source = val;
  }
});

/**
 * Src getter.
 *
 * TODO: return buffer
 *
 * @api public
 */

Image.prototype.__defineGetter__('src', function(){
  return this.source;
});

/**
 * Inspect image.
 *
 * TODO: indicate that the .src was a buffer, data uri etc
 *
 * @return {String}
 * @api public
 */

Image.prototype.inspect = function(){
  return '[Image'
    + (this.complete ? ':' + this.width + 'x' + this.height : '')
    + (this.src ? ' ' + this.src : '')
    + (this.complete ? ' complete' : '')
    + ']';
};
  })();
});

require.register("canvas/lib/jpegstream.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "canvas");
  (function() {
    'use strict';

/*!
 * Canvas - JPEGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Stream = require('stream').Stream;

/**
 * Initialize a `JPEGStream` with the given `canvas`.
 *
 * "data" events are emitted with `Buffer` chunks, once complete the
 * "end" event is emitted. The following example will stream to a file
 * named "./my.jpeg".
 *
 *     var out = fs.createWriteStream(__dirname + '/my.jpeg')
 *       , stream = canvas.createJPEGStream();
 *
 *     stream.pipe(out);
 *
 * @param {Canvas} canvas
 * @param {Boolean} sync
 * @api public
 */

var JPEGStream = module.exports = function JPEGStream(canvas, options, sync) {
  var self = this
    , method = sync
      ? 'streamJPEGSync'
      : 'streamJPEG';
  this.options = options;
  this.sync = sync;
  this.canvas = canvas;
  this.readable = true;
  // TODO: implement async
  if ('streamJPEG' == method) method = 'streamJPEGSync';
  process.nextTick(function(){
    canvas[method](options.bufsize, options.quality, options.progressive, function(err, chunk){
      if (err) {
        self.emit('error', err);
        self.readable = false;
      } else if (chunk) {
        self.emit('data', chunk);
      } else {
        self.emit('end');
        self.readable = false;
      }
    });
  });
};

/**
 * Inherit from `EventEmitter`.
 */

JPEGStream.prototype.__proto__ = Stream.prototype;
  })();
});

require.register("canvas/lib/pdfstream.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "canvas");
  (function() {
    'use strict';

/*!
 * Canvas - PDFStream
 */

/**
 * Module dependencies.
 */

var Stream = require('stream').Stream;

/**
 * Initialize a `PDFStream` with the given `canvas`.
 *
 * "data" events are emitted with `Buffer` chunks, once complete the
 * "end" event is emitted. The following example will stream to a file
 * named "./my.pdf".
 *
 *     var out = fs.createWriteStream(__dirname + '/my.pdf')
 *       , stream = canvas.createPDFStream();
 *
 *     stream.pipe(out);
 *
 * @param {Canvas} canvas
 * @param {Boolean} sync
 * @api public
 */

var PDFStream = module.exports = function PDFStream(canvas, sync) {
  var self = this
    , method = sync
      ? 'streamPDFSync'
      : 'streamPDF';
  this.sync = sync;
  this.canvas = canvas;
  this.readable = true;
  // TODO: implement async
  if ('streamPDF' == method) method = 'streamPDFSync';
  process.nextTick(function(){
    canvas[method](function(err, chunk, len){
      if (err) {
        self.emit('error', err);
        self.readable = false;
      } else if (len) {
        self.emit('data', chunk, len);
      } else {
        self.emit('end');
        self.readable = false;
      }
    });
  });
};

/**
 * Inherit from `EventEmitter`.
 */

PDFStream.prototype.__proto__ = Stream.prototype;
  })();
});

require.register("canvas/lib/pngstream.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "canvas");
  (function() {
    'use strict';

/*!
 * Canvas - PNGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Stream = require('stream').Stream;

/**
 * Initialize a `PNGStream` with the given `canvas`.
 *
 * "data" events are emitted with `Buffer` chunks, once complete the
 * "end" event is emitted. The following example will stream to a file
 * named "./my.png".
 *
 *     var out = fs.createWriteStream(__dirname + '/my.png')
 *       , stream = canvas.createPNGStream();
 *
 *     stream.pipe(out);
 *
 * @param {Canvas} canvas
 * @param {Boolean} sync
 * @api public
 */

var PNGStream = module.exports = function PNGStream(canvas, sync) {
  var self = this
    , method = sync
      ? 'streamPNGSync'
      : 'streamPNG';
  this.sync = sync;
  this.canvas = canvas;
  this.readable = true;
  // TODO: implement async
  if ('streamPNG' == method) method = 'streamPNGSync';
  process.nextTick(function(){
    canvas[method](function(err, chunk, len){
      if (err) {
        self.emit('error', err);
        self.readable = false;
      } else if (len) {
        self.emit('data', chunk, len);
      } else {
        self.emit('end');
        self.readable = false;
      }
    });
  });
};

/**
 * Inherit from `EventEmitter`.
 */

PNGStream.prototype.__proto__ = Stream.prototype;
  })();
});
require.register("canvas/package.json", function(exports, require, module) {
  module.exports = {
  "_args": [
    [
      {
        "raw": "canvas@^1.6.7",
        "scope": null,
        "escapedName": "canvas",
        "name": "canvas",
        "rawSpec": "^1.6.7",
        "spec": ">=1.6.7 <2.0.0",
        "type": "range"
      },
      "/Users/katehedgpeth/Documents/resemblixir/assets"
    ]
  ],
  "_from": "canvas@>=1.6.7 <2.0.0",
  "_id": "canvas@1.6.7",
  "_inCache": true,
  "_location": "/canvas",
  "_nodeVersion": "8.4.0",
  "_npmOperationalInternal": {
    "host": "s3://npm-registry-packages",
    "tmp": "tmp/canvas-1.6.7.tgz_1504863402684_0.15115133952349424"
  },
  "_npmUser": {
    "name": "linusu",
    "email": "linus@folkdatorn.se"
  },
  "_npmVersion": "5.3.0",
  "_phantomChildren": {},
  "_requested": {
    "raw": "canvas@^1.6.7",
    "scope": null,
    "escapedName": "canvas",
    "name": "canvas",
    "rawSpec": "^1.6.7",
    "spec": ">=1.6.7 <2.0.0",
    "type": "range"
  },
  "_requiredBy": [
    "#DEV:/"
  ],
  "_resolved": "https://registry.npmjs.org/canvas/-/canvas-1.6.7.tgz",
  "_shasum": "2d8a04b453ec5d6510727cfc697e236dc4ae85dc",
  "_shrinkwrap": null,
  "_spec": "canvas@^1.6.7",
  "_where": "/Users/katehedgpeth/Documents/resemblixir/assets",
  "author": {
    "name": "TJ Holowaychuk",
    "email": "tj@learnboost.com"
  },
  "bugs": {
    "url": "https://github.com/Automattic/node-canvas/issues"
  },
  "contributors": [
    {
      "name": "Nathan Rajlich",
      "email": "nathan@tootallnate.net"
    },
    {
      "name": "Rod Vagg",
      "email": "r@va.gg"
    },
    {
      "name": "Juriy Zaytsev",
      "email": "kangax@gmail.com"
    }
  ],
  "dependencies": {
    "nan": "^2.4.0",
    "parse-css-font": "^2.0.2",
    "units-css": "^0.4.0"
  },
  "description": "Canvas graphics API backed by Cairo",
  "devDependencies": {
    "body-parser": "^1.13.3",
    "express": "^4.13.2",
    "mocha": "*",
    "pug": "^2.0.0-beta3",
    "standard": "^10.0.3"
  },
  "directories": {},
  "dist": {
    "integrity": "sha512-QLFCd9ca/Ww3s4vUf1KxmTX2QoYu8sZkSvXQ36RdbqNETDjn/I1H01ZEtWGGLcY0T7zNO6nsGoHX+0zrMy6JrQ==",
    "shasum": "2d8a04b453ec5d6510727cfc697e236dc4ae85dc",
    "tarball": "https://registry.npmjs.org/canvas/-/canvas-1.6.7.tgz"
  },
  "engines": {
    "node": ">=0.8.0"
  },
  "gitHead": "db4e48c3936095e3bf191ab7b70d91eaa86db37c",
  "gypfile": true,
  "homepage": "https://github.com/Automattic/node-canvas",
  "keywords": [
    "canvas",
    "graphic",
    "graphics",
    "pixman",
    "cairo",
    "image",
    "images",
    "pdf"
  ],
  "license": "MIT",
  "main": "./lib/canvas.js",
  "maintainers": [
    {
      "name": "linusu",
      "email": "linus@folkdatorn.se"
    },
    {
      "name": "domenic",
      "email": "d@domenic.me"
    },
    {
      "name": "kangax",
      "email": "kangax@gmail.com"
    },
    {
      "name": "tootallnate",
      "email": "nathan@tootallnate.net"
    },
    {
      "name": "rauchg",
      "email": "rauchg@gmail.com"
    },
    {
      "name": "tjholowaychuk",
      "email": "tj@vision-media.ca"
    }
  ],
  "name": "canvas",
  "optionalDependencies": {},
  "readme": "ERROR: No README data found!",
  "repository": {
    "type": "git",
    "url": "git://github.com/Automattic/node-canvas.git"
  },
  "scripts": {
    "benchmark": "node benchmarks/run.js",
    "install": "node-gyp rebuild",
    "prebenchmark": "node-gyp build",
    "pretest": "node-gyp build",
    "pretest-server": "node-gyp build",
    "test": "standard examples/*.js && mocha test/*.test.js",
    "test-server": "node test/server.js"
  },
  "version": "1.6.7"
}
;
});

require.register("core-util-is/lib/util.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "core-util-is");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}
  })();
});
require.register("css-font-size-keywords/index.json", function(exports, require, module) {
  module.exports = [
	"xx-small",
	"x-small",
	"small",
	"medium",
	"large",
	"x-large",
	"xx-large",
	"larger",
	"smaller"
]
;
});
require.register("css-font-stretch-keywords/index.json", function(exports, require, module) {
  module.exports = [
	"normal",
	"condensed",
	"semi-condensed",
	"extra-condensed",
	"ultra-condensed",
	"expanded",
	"semi-expanded",
	"extra-expanded",
	"ultra-expanded"
]
;
});
require.register("css-font-style-keywords/index.json", function(exports, require, module) {
  module.exports = [
	"normal",
	"italic",
	"oblique"
]
;
});
require.register("css-font-weight-keywords/index.json", function(exports, require, module) {
  module.exports = [
	"normal",
	"bold",
	"bolder",
	"lighter",
	"100",
	"200",
	"300",
	"400",
	"500",
	"600",
	"700",
	"800",
	"900"
]
;
});
require.register("css-global-keywords/index.json", function(exports, require, module) {
  module.exports = [
	"inherit",
	"initial",
	"unset"
]
;
});

require.register("css-list-helpers/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "css-list-helpers");
  (function() {
    var t = require('tcomb');

var Options = t.struct({
	last: t.maybe(t.Boolean)
});

var helpers = {

	split: function(value, separators, options) {
		return split(value, separators, options || {});
	},

	splitBySpaces: t.func(t.String, t.Array).of(
		function(value) {
			var spaces = [' ', '\n', '\t'];
			return helpers.split(value, spaces);
		}
	),

	splitByCommas: t.func(t.String, t.Array).of(
		function(value) {
			var comma = ',';
			return helpers.split(value, [comma], { last: true });
		}
	)

};

var split = t.func([t.String, t.Array, Options], t.Array).of(
	function(value, separators, options) {
		var array   = [];
		var current = '';
		var split   = false;

		var func    = 0;
		var quote   = false;
		var escape  = false;

		for (var i = 0; i < value.length; i++) {
			var char = value[i];

			if (quote) {
				if (escape) {
					escape = false;
				} else if (char === '\\') {
					escape = true;
				} else if (char === quote) {
					quote = false;
				}
			} else if (char === '"' || char === '\'') {
				quote = char;
			} else if (char === '(') {
				func += 1;
			} else if (char === ')') {
				if (func > 0) {
					func -= 1;
				}
			} else if (func === 0) {
				if (separators.indexOf(char) !== -1) {
					split = true;
				}
			}

			if (split) {
				if (current !== '') {
					array.push(current.trim());
				}
				current = '';
				split = false;
			} else {
				current += char;
			}
		}

		if (options.last || current !== '') {
			array.push(current.trim());
		}
		return array;
	}
);

module.exports = helpers;
  })();
});
require.register("css-system-font-keywords/index.json", function(exports, require, module) {
  module.exports = [
	"caption",
	"icon",
	"menu",
	"message-box",
	"small-caption",
	"status-bar"
]
;
});

require.register("events/events.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "events");
  (function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}
  })();
});

require.register("ieee754/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ieee754");
  (function() {
    exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}
  })();
});

require.register("inherits/inherits_browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "inherits");
  (function() {
    if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}
  })();
});

require.register("isarray/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "isarray");
  (function() {
    var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};
  })();
});

require.register("isnumeric/isNumeric.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "isnumeric");
  (function() {
    var isNumeric = function (obj) {
    obj = typeof(obj) === "string" ? obj.replace(/,/g, "") : obj;
    return !isNaN(parseFloat(obj)) && isFinite(obj) && Object.prototype.toString.call(obj).toLowerCase() !== "[object array]";
};

if (typeof (exports) !== "undefined") {
    if (typeof (module) !== "undefined" && module.exports) {
        exports = module.exports = isNumeric;
    }
    exports.isNumeric = isNumeric;
}
  })();
});

require.register("parse-css-font/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "parse-css-font");
  (function() {
    var t = require('tcomb');
var unquote = require('unquote');
var globalKeywords = require('css-global-keywords');
var systemFontKeywords = require('css-system-font-keywords');
var fontWeightKeywords = require('css-font-weight-keywords');
var fontStyleKeywords = require('css-font-style-keywords');
var fontStretchKeywords = require('css-font-stretch-keywords');
var cssListHelpers = require('css-list-helpers');

var helpers = require('./lib/helpers');

var SystemFont = t.struct({
	system: t.String
});

var Font = t.struct({
	style: t.String,
	variant: t.String,
	weight: t.String,
	stretch: t.String,
	size: t.String,
	lineHeight: t.union([t.String, t.Number]),
	family: t.list(t.String)
});

var Result = t.union([Font, SystemFont]);

module.exports = t.func(t.String, t.Object).of(
	function(value) {

		if (value === '') {
			throw error('Cannot parse an empty string.');
		}

		if (systemFontKeywords.indexOf(value) !== -1) {
			return SystemFont({ system: value });
		}

		var font = {
			style: 'normal',
			variant: 'normal',
			weight: 'normal',
			stretch: 'normal',
			lineHeight: 'normal'
		};

		var isLocked = false;
		var tokens = cssListHelpers.splitBySpaces(value);
		var token = tokens.shift();
		for (; !t.Nil.is(token); token = tokens.shift()) {

			if (token === 'normal' || globalKeywords.indexOf(token) !== -1) {
				['style', 'variant', 'weight', 'stretch'].forEach(function(prop) {
					font[prop] = token;
				});
				isLocked = true;
				continue;
			}

			if (fontWeightKeywords.indexOf(token) !== -1) {
				if (isLocked) {
					continue;
				}
				font.weight = token;
				continue;
			}

			if (fontStyleKeywords.indexOf(token) !== -1) {
				if (isLocked) {
					continue;
				}
				font.style = token;
				continue;
			}

			if (fontStretchKeywords.indexOf(token) !== -1) {
				if (isLocked) {
					continue;
				}
				font.stretch = token;
				continue;
			}

			if (helpers.isSize(token)) {
				var parts = cssListHelpers.split(token, ['/']);
				font.size = parts[0];
				if (!t.Nil.is(parts[1])) {
					font.lineHeight = parseLineHeight(parts[1]);
				}
				if (!tokens.length) {
					throw error('Missing required font-family.');
				}
				font.family = cssListHelpers.splitByCommas(tokens.join(' ')).map(unquote);
				return Font(font);
			}

			if (font.variant !== 'normal') {
				throw error('Unknown or unsupported font token: ' + font.variant);
			}

			if (isLocked) {
				continue;
			}
			font.variant = token;
		}

		throw error('Missing required font-size.');
	}
);

function error(message) {
	return new Error('[parse-css-font] ' + message);
}

function parseLineHeight(value) {
	var parsed = parseFloat(value);
	if (parsed.toString() === value) {
		return parsed;
	}
	return value;
}
  })();
});

require.register("parse-css-font/lib/helpers.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "parse-css-font");
  (function() {
    var cssFontSizeKeywords = require('css-font-size-keywords');

module.exports = {

	isSize: function(value) {
		return /^[\d\.]/.test(value)
			|| value.indexOf('/') !== -1
			|| cssFontSizeKeywords.indexOf(value) !== -1
		;
	}

};
  })();
});

require.register("phoenix/priv/static/phoenix.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "phoenix");
  (function() {
    (function (global, factory) {
typeof exports === 'object' ? factory(exports) :
typeof define === 'function' && define.amd ? define(['exports'], factory) :
factory(global.Phoenix = global.Phoenix || {});
}(this, (function (exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Phoenix Channels JavaScript client
 *
 * ## Socket Connection
 *
 * A single connection is established to the server and
 * channels are multiplexed over the connection.
 * Connect to the server using the `Socket` class:
 *
 * ```javascript
 *     let socket = new Socket("/socket", {params: {userToken: "123"}})
 *     socket.connect()
 * ```
 *
 * The `Socket` constructor takes the mount point of the socket,
 * the authentication params, as well as options that can be found in
 * the Socket docs, such as configuring the `LongPoll` transport, and
 * heartbeat.
 *
 * ## Channels
 *
 * Channels are isolated, concurrent processes on the server that
 * subscribe to topics and broker events between the client and server.
 * To join a channel, you must provide the topic, and channel params for
 * authorization. Here's an example chat room example where `"new_msg"`
 * events are listened for, messages are pushed to the server, and
 * the channel is joined with ok/error/timeout matches:
 *
 * ```javascript
 *     let channel = socket.channel("room:123", {token: roomToken})
 *     channel.on("new_msg", msg => console.log("Got message", msg) )
 *     $input.onEnter( e => {
 *       channel.push("new_msg", {body: e.target.val}, 10000)
 *        .receive("ok", (msg) => console.log("created message", msg) )
 *        .receive("error", (reasons) => console.log("create failed", reasons) )
 *        .receive("timeout", () => console.log("Networking issue...") )
 *     })
 *     channel.join()
 *       .receive("ok", ({messages}) => console.log("catching up", messages) )
 *       .receive("error", ({reason}) => console.log("failed join", reason) )
 *       .receive("timeout", () => console.log("Networking issue. Still waiting...") )
 *```
 *
 * ## Joining
 *
 * Creating a channel with `socket.channel(topic, params)`, binds the params to
 * `channel.params`, which are sent up on `channel.join()`.
 * Subsequent rejoins will send up the modified params for
 * updating authorization params, or passing up last_message_id information.
 * Successful joins receive an "ok" status, while unsuccessful joins
 * receive "error".
 *
 * ## Duplicate Join Subscriptions
 *
 * While the client may join any number of topics on any number of channels,
 * the client may only hold a single subscription for each unique topic at any
 * given time. When attempting to create a duplicate subscription,
 * the server will close the existing channel, log a warning, and
 * spawn a new channel for the topic. The client will have their
 * `channel.onClose` callbacks fired for the existing channel, and the new
 * channel join will have its receive hooks processed as normal.
 *
 * ## Pushing Messages
 *
 * From the previous example, we can see that pushing messages to the server
 * can be done with `channel.push(eventName, payload)` and we can optionally
 * receive responses from the push. Additionally, we can use
 * `receive("timeout", callback)` to abort waiting for our other `receive` hooks
 *  and take action after some period of waiting. The default timeout is 5000ms.
 *
 *
 * ## Socket Hooks
 *
 * Lifecycle events of the multiplexed connection can be hooked into via
 * `socket.onError()` and `socket.onClose()` events, ie:
 *
 * ```javascript
 *     socket.onError( () => console.log("there was an error with the connection!") )
 *     socket.onClose( () => console.log("the connection dropped") )
 * ```
 *
 *
 * ## Channel Hooks
 *
 * For each joined channel, you can bind to `onError` and `onClose` events
 * to monitor the channel lifecycle, ie:
 *
 * ```javascript
 *     channel.onError( () => console.log("there was an error!") )
 *     channel.onClose( () => console.log("the channel has gone away gracefully") )
 * ```
 *
 * ### onError hooks
 *
 * `onError` hooks are invoked if the socket connection drops, or the channel
 * crashes on the server. In either case, a channel rejoin is attempted
 * automatically in an exponential backoff manner.
 *
 * ### onClose hooks
 *
 * `onClose` hooks are invoked only in two cases. 1) the channel explicitly
 * closed on the server, or 2). The client explicitly closed, by calling
 * `channel.leave()`
 *
 *
 * ## Presence
 *
 * The `Presence` object provides features for syncing presence information
 * from the server with the client and handling presences joining and leaving.
 *
 * ### Syncing initial state from the server
 *
 * `Presence.syncState` is used to sync the list of presences on the server
 * with the client's state. An optional `onJoin` and `onLeave` callback can
 * be provided to react to changes in the client's local presences across
 * disconnects and reconnects with the server.
 *
 * `Presence.syncDiff` is used to sync a diff of presence join and leave
 * events from the server, as they happen. Like `syncState`, `syncDiff`
 * accepts optional `onJoin` and `onLeave` callbacks to react to a user
 * joining or leaving from a device.
 *
 * ### Listing Presences
 *
 * `Presence.list` is used to return a list of presence information
 * based on the local state of metadata. By default, all presence
 * metadata is returned, but a `listBy` function can be supplied to
 * allow the client to select which metadata to use for a given presence.
 * For example, you may have a user online from different devices with
 * a metadata status of "online", but they have set themselves to "away"
 * on another device. In this case, the app may choose to use the "away"
 * status for what appears on the UI. The example below defines a `listBy`
 * function which prioritizes the first metadata which was registered for
 * each user. This could be the first tab they opened, or the first device
 * they came online from:
 *
 * ```javascript
 *     let state = {}
 *     state = Presence.syncState(state, stateFromServer)
 *     let listBy = (id, {metas: [first, ...rest]}) => {
 *       first.count = rest.length + 1 // count of this user's presences
 *       first.id = id
 *       return first
 *     }
 *     let onlineUsers = Presence.list(state, listBy)
 * ```
 *
 *
 * ### Example Usage
 *```javascript
 *     // detect if user has joined for the 1st time or from another tab/device
 *     let onJoin = (id, current, newPres) => {
 *       if(!current){
 *         console.log("user has entered for the first time", newPres)
 *       } else {
 *         console.log("user additional presence", newPres)
 *       }
 *     }
 *     // detect if user has left from all tabs/devices, or is still present
 *     let onLeave = (id, current, leftPres) => {
 *       if(current.metas.length === 0){
 *         console.log("user has left from all devices", leftPres)
 *       } else {
 *         console.log("user left from a device", leftPres)
 *       }
 *     }
 *     let presences = {} // client's initial empty presence state
 *     // receive initial presence data from server, sent after join
 *     myChannel.on("presence_state", state => {
 *       presences = Presence.syncState(presences, state, onJoin, onLeave)
 *       displayUsers(Presence.list(presences))
 *     })
 *     // receive "presence_diff" from server, containing join/leave events
 *     myChannel.on("presence_diff", diff => {
 *       presences = Presence.syncDiff(presences, diff, onJoin, onLeave)
 *       this.setState({users: Presence.list(room.presences, listBy)})
 *     })
 * ```
 * @module phoenix
 */

var VSN = "2.0.0";
var SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 };
var DEFAULT_TIMEOUT = 10000;
var WS_CLOSE_NORMAL = 1000;
var CHANNEL_STATES = {
  closed: "closed",
  errored: "errored",
  joined: "joined",
  joining: "joining",
  leaving: "leaving"
};
var CHANNEL_EVENTS = {
  close: "phx_close",
  error: "phx_error",
  join: "phx_join",
  reply: "phx_reply",
  leave: "phx_leave"
};
var CHANNEL_LIFECYCLE_EVENTS = [CHANNEL_EVENTS.close, CHANNEL_EVENTS.error, CHANNEL_EVENTS.join, CHANNEL_EVENTS.reply, CHANNEL_EVENTS.leave];
var TRANSPORTS = {
  longpoll: "longpoll",
  websocket: "websocket"
};

/**
 * Initializes the Push
 * @param {Channel} channel - The Channel
 * @param {string} event - The event, for example `"phx_join"`
 * @param {Object} payload - The payload, for example `{user_id: 123}`
 * @param {number} timeout - The push timeout in milliseconds
 */

var Push = function () {
  function Push(channel, event, payload, timeout) {
    _classCallCheck(this, Push);

    this.channel = channel;
    this.event = event;
    this.payload = payload || {};
    this.receivedResp = null;
    this.timeout = timeout;
    this.timeoutTimer = null;
    this.recHooks = [];
    this.sent = false;
  }

  /**
   *
   * @param {number} timeout
   */


  _createClass(Push, [{
    key: "resend",
    value: function resend(timeout) {
      this.timeout = timeout;
      this.reset();
      this.send();
    }

    /**
     *
     */

  }, {
    key: "send",
    value: function send() {
      if (this.hasReceived("timeout")) {
        return;
      }
      this.startTimeout();
      this.sent = true;
      this.channel.socket.push({
        topic: this.channel.topic,
        event: this.event,
        payload: this.payload,
        ref: this.ref,
        join_ref: this.channel.joinRef()
      });
    }

    /**
     *
     * @param {*} status
     * @param {*} callback
     */

  }, {
    key: "receive",
    value: function receive(status, callback) {
      if (this.hasReceived(status)) {
        callback(this.receivedResp.response);
      }

      this.recHooks.push({ status: status, callback: callback });
      return this;
    }

    // private

  }, {
    key: "reset",
    value: function reset() {
      this.cancelRefEvent();
      this.ref = null;
      this.refEvent = null;
      this.receivedResp = null;
      this.sent = false;
    }
  }, {
    key: "matchReceive",
    value: function matchReceive(_ref) {
      var status = _ref.status,
          response = _ref.response,
          ref = _ref.ref;

      this.recHooks.filter(function (h) {
        return h.status === status;
      }).forEach(function (h) {
        return h.callback(response);
      });
    }
  }, {
    key: "cancelRefEvent",
    value: function cancelRefEvent() {
      if (!this.refEvent) {
        return;
      }
      this.channel.off(this.refEvent);
    }
  }, {
    key: "cancelTimeout",
    value: function cancelTimeout() {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }, {
    key: "startTimeout",
    value: function startTimeout() {
      var _this = this;

      if (this.timeoutTimer) {
        this.cancelTimeout();
      }
      this.ref = this.channel.socket.makeRef();
      this.refEvent = this.channel.replyEventName(this.ref);

      this.channel.on(this.refEvent, function (payload) {
        _this.cancelRefEvent();
        _this.cancelTimeout();
        _this.receivedResp = payload;
        _this.matchReceive(payload);
      });

      this.timeoutTimer = setTimeout(function () {
        _this.trigger("timeout", {});
      }, this.timeout);
    }
  }, {
    key: "hasReceived",
    value: function hasReceived(status) {
      return this.receivedResp && this.receivedResp.status === status;
    }
  }, {
    key: "trigger",
    value: function trigger(status, response) {
      this.channel.trigger(this.refEvent, { status: status, response: response });
    }
  }]);

  return Push;
}();

/**
 *
 * @param {string} topic
 * @param {Object} params
 * @param {Socket} socket
 */


var Channel = exports.Channel = function () {
  function Channel(topic, params, socket) {
    var _this2 = this;

    _classCallCheck(this, Channel);

    this.state = CHANNEL_STATES.closed;
    this.topic = topic;
    this.params = params || {};
    this.socket = socket;
    this.bindings = [];
    this.timeout = this.socket.timeout;
    this.joinedOnce = false;
    this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
    this.pushBuffer = [];
    this.rejoinTimer = new Timer(function () {
      return _this2.rejoinUntilConnected();
    }, this.socket.reconnectAfterMs);
    this.joinPush.receive("ok", function () {
      _this2.state = CHANNEL_STATES.joined;
      _this2.rejoinTimer.reset();
      _this2.pushBuffer.forEach(function (pushEvent) {
        return pushEvent.send();
      });
      _this2.pushBuffer = [];
    });
    this.onClose(function () {
      _this2.rejoinTimer.reset();
      _this2.socket.log("channel", "close " + _this2.topic + " " + _this2.joinRef());
      _this2.state = CHANNEL_STATES.closed;
      _this2.socket.remove(_this2);
    });
    this.onError(function (reason) {
      if (_this2.isLeaving() || _this2.isClosed()) {
        return;
      }
      _this2.socket.log("channel", "error " + _this2.topic, reason);
      _this2.state = CHANNEL_STATES.errored;
      _this2.rejoinTimer.scheduleTimeout();
    });
    this.joinPush.receive("timeout", function () {
      if (!_this2.isJoining()) {
        return;
      }
      _this2.socket.log("channel", "timeout " + _this2.topic + " (" + _this2.joinRef() + ")", _this2.joinPush.timeout);
      var leavePush = new Push(_this2, CHANNEL_EVENTS.leave, {}, _this2.timeout);
      leavePush.send();
      _this2.state = CHANNEL_STATES.errored;
      _this2.joinPush.reset();
      _this2.rejoinTimer.scheduleTimeout();
    });
    this.on(CHANNEL_EVENTS.reply, function (payload, ref) {
      _this2.trigger(_this2.replyEventName(ref), payload);
    });
  }

  _createClass(Channel, [{
    key: "rejoinUntilConnected",
    value: function rejoinUntilConnected() {
      this.rejoinTimer.scheduleTimeout();
      if (this.socket.isConnected()) {
        this.rejoin();
      }
    }
  }, {
    key: "join",
    value: function join() {
      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.timeout;

      if (this.joinedOnce) {
        throw "tried to join multiple times. 'join' can only be called a single time per channel instance";
      } else {
        this.joinedOnce = true;
        this.rejoin(timeout);
        return this.joinPush;
      }
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.on(CHANNEL_EVENTS.close, callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.on(CHANNEL_EVENTS.error, function (reason) {
        return callback(reason);
      });
    }
  }, {
    key: "on",
    value: function on(event, callback) {
      this.bindings.push({ event: event, callback: callback });
    }
  }, {
    key: "off",
    value: function off(event) {
      this.bindings = this.bindings.filter(function (bind) {
        return bind.event !== event;
      });
    }
  }, {
    key: "canPush",
    value: function canPush() {
      return this.socket.isConnected() && this.isJoined();
    }
  }, {
    key: "push",
    value: function push(event, payload) {
      var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.timeout;

      if (!this.joinedOnce) {
        throw "tried to push '" + event + "' to '" + this.topic + "' before joining. Use channel.join() before pushing events";
      }
      var pushEvent = new Push(this, event, payload, timeout);
      if (this.canPush()) {
        pushEvent.send();
      } else {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
      }

      return pushEvent;
    }

    /** Leaves the channel
     *
     * Unsubscribes from server events, and
     * instructs channel to terminate on server
     *
     * Triggers onClose() hooks
     *
     * To receive leave acknowledgements, use the a `receive`
     * hook to bind to the server ack, ie:
     *
     * ```javascript
     *     channel.leave().receive("ok", () => alert("left!") )
     * ```
     */

  }, {
    key: "leave",
    value: function leave() {
      var _this3 = this;

      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.timeout;

      this.state = CHANNEL_STATES.leaving;
      var onClose = function onClose() {
        _this3.socket.log("channel", "leave " + _this3.topic);
        _this3.trigger(CHANNEL_EVENTS.close, "leave");
      };
      var leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
      leavePush.receive("ok", function () {
        return onClose();
      }).receive("timeout", function () {
        return onClose();
      });
      leavePush.send();
      if (!this.canPush()) {
        leavePush.trigger("ok", {});
      }

      return leavePush;
    }

    /**
     * Overridable message hook
     *
     * Receives all events for specialized message handling
     * before dispatching to the channel callbacks.
     *
     * Must return the payload, modified or unmodified
     */

  }, {
    key: "onMessage",
    value: function onMessage(event, payload, ref) {
      return payload;
    }

    // private

  }, {
    key: "isMember",
    value: function isMember(topic, event, payload, joinRef) {
      if (this.topic !== topic) {
        return false;
      }
      var isLifecycleEvent = CHANNEL_LIFECYCLE_EVENTS.indexOf(event) >= 0;

      if (joinRef && isLifecycleEvent && joinRef !== this.joinRef()) {
        this.socket.log("channel", "dropping outdated message", { topic: topic, event: event, payload: payload, joinRef: joinRef });
        return false;
      } else {
        return true;
      }
    }
  }, {
    key: "joinRef",
    value: function joinRef() {
      return this.joinPush.ref;
    }
  }, {
    key: "sendJoin",
    value: function sendJoin(timeout) {
      this.state = CHANNEL_STATES.joining;
      this.joinPush.resend(timeout);
    }
  }, {
    key: "rejoin",
    value: function rejoin() {
      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.timeout;
      if (this.isLeaving()) {
        return;
      }
      this.sendJoin(timeout);
    }
  }, {
    key: "trigger",
    value: function trigger(event, payload, ref, joinRef) {
      var _this4 = this;

      var handledPayload = this.onMessage(event, payload, ref, joinRef);
      if (payload && !handledPayload) {
        throw "channel onMessage callbacks must return the payload, modified or unmodified";
      }

      this.bindings.filter(function (bind) {
        return bind.event === event;
      }).map(function (bind) {
        return bind.callback(handledPayload, ref, joinRef || _this4.joinRef());
      });
    }
  }, {
    key: "replyEventName",
    value: function replyEventName(ref) {
      return "chan_reply_" + ref;
    }
  }, {
    key: "isClosed",
    value: function isClosed() {
      return this.state === CHANNEL_STATES.closed;
    }
  }, {
    key: "isErrored",
    value: function isErrored() {
      return this.state === CHANNEL_STATES.errored;
    }
  }, {
    key: "isJoined",
    value: function isJoined() {
      return this.state === CHANNEL_STATES.joined;
    }
  }, {
    key: "isJoining",
    value: function isJoining() {
      return this.state === CHANNEL_STATES.joining;
    }
  }, {
    key: "isLeaving",
    value: function isLeaving() {
      return this.state === CHANNEL_STATES.leaving;
    }
  }]);

  return Channel;
}();

var Serializer = {
  encode: function encode(msg, callback) {
    var payload = [msg.join_ref, msg.ref, msg.topic, msg.event, msg.payload];
    return callback(JSON.stringify(payload));
  },
  decode: function decode(rawPayload, callback) {
    var _JSON$parse = JSON.parse(rawPayload),
        _JSON$parse2 = _slicedToArray(_JSON$parse, 5),
        join_ref = _JSON$parse2[0],
        ref = _JSON$parse2[1],
        topic = _JSON$parse2[2],
        event = _JSON$parse2[3],
        payload = _JSON$parse2[4];

    return callback({ join_ref: join_ref, ref: ref, topic: topic, event: event, payload: payload });
  }
};

/** Initializes the Socket
 *
 *
 * For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
 *
 * @param {string} endPoint - The string WebSocket endpoint, ie, `"ws://example.com/socket"`,
 *                                               `"wss://example.com"`
 *                                               `"/socket"` (inherited host & protocol)
 * @param {Object} opts - Optional configuration
 * @param {string} opts.transport - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
 *
 * Defaults to WebSocket with automatic LongPoll fallback.
 * @param {Function} opts.encode - The function to encode outgoing messages.
 *
 * Defaults to JSON:
 *
 * ```javascript
 * (payload, callback) => callback(JSON.stringify(payload))
 * ```
 *
 * @param {Function} opts.decode - The function to decode incoming messages.
 *
 * Defaults to JSON:
 *
 * ```javascript
 * (payload, callback) => callback(JSON.parse(payload))
 * ```
 *
 * @param {number} opts.timeout - The default timeout in milliseconds to trigger push timeouts.
 *
 * Defaults `DEFAULT_TIMEOUT`
 * @param {number} opts.heartbeatIntervalMs - The millisec interval to send a heartbeat message
 * @param {number} opts.reconnectAfterMs - The optional function that returns the millsec reconnect interval.
 *
 * Defaults to stepped backoff of:
 *
 * ```javascript
 *  function(tries){
 *    return [1000, 5000, 10000][tries - 1] || 10000
 *  }
 * ```
 * @param {Function} opts.logger - The optional function for specialized logging, ie:
 * ```javascript
 * logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
 * ```
 *
 * @param {number}  opts.longpollerTimeout - The maximum timeout of a long poll AJAX request.
 *
 * Defaults to 20s (double the server long poll timer).
 *
 * @param {Object}  opts.params - The optional params to pass when connecting
 *
 *
*/

var Socket = exports.Socket = function () {
  function Socket(endPoint) {
    var _this5 = this;

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Socket);

    this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] };
    this.channels = [];
    this.sendBuffer = [];
    this.ref = 0;
    this.timeout = opts.timeout || DEFAULT_TIMEOUT;
    this.transport = opts.transport || window.WebSocket || LongPoll;
    this.defaultEncoder = Serializer.encode;
    this.defaultDecoder = Serializer.decode;
    if (this.transport !== LongPoll) {
      this.encode = opts.encode || this.defaultEncoder;
      this.decode = opts.decode || this.defaultDecoder;
    } else {
      this.encode = this.defaultEncoder;
      this.decode = this.defaultDecoder;
    }
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 30000;
    this.reconnectAfterMs = opts.reconnectAfterMs || function (tries) {
      return [1000, 2000, 5000, 10000][tries - 1] || 10000;
    };
    this.logger = opts.logger || function () {}; // noop
    this.longpollerTimeout = opts.longpollerTimeout || 20000;
    this.params = opts.params || {};
    this.endPoint = endPoint + "/" + TRANSPORTS.websocket;
    this.heartbeatTimer = null;
    this.pendingHeartbeatRef = null;
    this.reconnectTimer = new Timer(function () {
      _this5.disconnect(function () {
        return _this5.connect();
      });
    }, this.reconnectAfterMs);
  }

  _createClass(Socket, [{
    key: "protocol",
    value: function protocol() {
      return location.protocol.match(/^https/) ? "wss" : "ws";
    }
  }, {
    key: "endPointURL",
    value: function endPointURL() {
      var uri = Ajax.appendParams(Ajax.appendParams(this.endPoint, this.params), { vsn: VSN });
      if (uri.charAt(0) !== "/") {
        return uri;
      }
      if (uri.charAt(1) === "/") {
        return this.protocol() + ":" + uri;
      }

      return this.protocol() + "://" + location.host + uri;
    }
  }, {
    key: "disconnect",
    value: function disconnect(callback, code, reason) {
      if (this.conn) {
        this.conn.onclose = function () {}; // noop
        if (code) {
          this.conn.close(code, reason || "");
        } else {
          this.conn.close();
        }
        this.conn = null;
      }
      callback && callback();
    }

    /**
     *
     * @param {Object} params - The params to send when connecting, for example `{user_id: userToken}`
     */

  }, {
    key: "connect",
    value: function connect(params) {
      var _this6 = this;

      if (params) {
        console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor");
        this.params = params;
      }
      if (this.conn) {
        return;
      }

      this.conn = new this.transport(this.endPointURL());
      this.conn.timeout = this.longpollerTimeout;
      this.conn.onopen = function () {
        return _this6.onConnOpen();
      };
      this.conn.onerror = function (error) {
        return _this6.onConnError(error);
      };
      this.conn.onmessage = function (event) {
        return _this6.onConnMessage(event);
      };
      this.conn.onclose = function (event) {
        return _this6.onConnClose(event);
      };
    }

    /**
     * Logs the message. Override `this.logger` for specialized logging. noops by default
     * @param {string} kind
     * @param {string} msg
     * @param {Object} data
     */

  }, {
    key: "log",
    value: function log(kind, msg, data) {
      this.logger(kind, msg, data);
    }

    // Registers callbacks for connection state change events
    //
    // Examples
    //
    //    socket.onError(function(error){ alert("An error occurred") })
    //

  }, {
    key: "onOpen",
    value: function onOpen(callback) {
      this.stateChangeCallbacks.open.push(callback);
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.stateChangeCallbacks.close.push(callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.stateChangeCallbacks.error.push(callback);
    }
  }, {
    key: "onMessage",
    value: function onMessage(callback) {
      this.stateChangeCallbacks.message.push(callback);
    }
  }, {
    key: "onConnOpen",
    value: function onConnOpen() {
      var _this7 = this;

      this.log("transport", "connected to " + this.endPointURL());
      this.flushSendBuffer();
      this.reconnectTimer.reset();
      if (!this.conn.skipHeartbeat) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(function () {
          return _this7.sendHeartbeat();
        }, this.heartbeatIntervalMs);
      }
      this.stateChangeCallbacks.open.forEach(function (callback) {
        return callback();
      });
    }
  }, {
    key: "onConnClose",
    value: function onConnClose(event) {
      this.log("transport", "close", event);
      this.triggerChanError();
      clearInterval(this.heartbeatTimer);
      this.reconnectTimer.scheduleTimeout();
      this.stateChangeCallbacks.close.forEach(function (callback) {
        return callback(event);
      });
    }
  }, {
    key: "onConnError",
    value: function onConnError(error) {
      this.log("transport", error);
      this.triggerChanError();
      this.stateChangeCallbacks.error.forEach(function (callback) {
        return callback(error);
      });
    }
  }, {
    key: "triggerChanError",
    value: function triggerChanError() {
      this.channels.forEach(function (channel) {
        return channel.trigger(CHANNEL_EVENTS.error);
      });
    }
  }, {
    key: "connectionState",
    value: function connectionState() {
      switch (this.conn && this.conn.readyState) {
        case SOCKET_STATES.connecting:
          return "connecting";
        case SOCKET_STATES.open:
          return "open";
        case SOCKET_STATES.closing:
          return "closing";
        default:
          return "closed";
      }
    }
  }, {
    key: "isConnected",
    value: function isConnected() {
      return this.connectionState() === "open";
    }
  }, {
    key: "remove",
    value: function remove(channel) {
      this.channels = this.channels.filter(function (c) {
        return c.joinRef() !== channel.joinRef();
      });
    }
  }, {
    key: "channel",
    value: function channel(topic) {
      var chanParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var chan = new Channel(topic, chanParams, this);
      this.channels.push(chan);
      return chan;
    }
  }, {
    key: "push",
    value: function push(data) {
      var _this8 = this;

      var topic = data.topic,
          event = data.event,
          payload = data.payload,
          ref = data.ref,
          join_ref = data.join_ref;

      var callback = function callback() {
        _this8.encode(data, function (result) {
          _this8.conn.send(result);
        });
      };
      this.log("push", topic + " " + event + " (" + join_ref + ", " + ref + ")", payload);
      if (this.isConnected()) {
        callback();
      } else {
        this.sendBuffer.push(callback);
      }
    }

    /**
     * Return the next message ref, accounting for overflows
     */

  }, {
    key: "makeRef",
    value: function makeRef() {
      var newRef = this.ref + 1;
      if (newRef === this.ref) {
        this.ref = 0;
      } else {
        this.ref = newRef;
      }

      return this.ref.toString();
    }
  }, {
    key: "sendHeartbeat",
    value: function sendHeartbeat() {
      if (!this.isConnected()) {
        return;
      }
      if (this.pendingHeartbeatRef) {
        this.pendingHeartbeatRef = null;
        this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
        this.conn.close(WS_CLOSE_NORMAL, "hearbeat timeout");
        return;
      }
      this.pendingHeartbeatRef = this.makeRef();
      this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.pendingHeartbeatRef });
    }
  }, {
    key: "flushSendBuffer",
    value: function flushSendBuffer() {
      if (this.isConnected() && this.sendBuffer.length > 0) {
        this.sendBuffer.forEach(function (callback) {
          return callback();
        });
        this.sendBuffer = [];
      }
    }
  }, {
    key: "onConnMessage",
    value: function onConnMessage(rawMessage) {
      var _this9 = this;

      this.decode(rawMessage.data, function (msg) {
        var topic = msg.topic,
            event = msg.event,
            payload = msg.payload,
            ref = msg.ref,
            join_ref = msg.join_ref;

        if (ref && ref === _this9.pendingHeartbeatRef) {
          _this9.pendingHeartbeatRef = null;
        }

        _this9.log("receive", (payload.status || "") + " " + topic + " " + event + " " + (ref && "(" + ref + ")" || ""), payload);
        _this9.channels.filter(function (channel) {
          return channel.isMember(topic, event, payload, join_ref);
        }).forEach(function (channel) {
          return channel.trigger(event, payload, ref, join_ref);
        });
        _this9.stateChangeCallbacks.message.forEach(function (callback) {
          return callback(msg);
        });
      });
    }
  }]);

  return Socket;
}();

var LongPoll = exports.LongPoll = function () {
  function LongPoll(endPoint) {
    _classCallCheck(this, LongPoll);

    this.endPoint = null;
    this.token = null;
    this.skipHeartbeat = true;
    this.onopen = function () {}; // noop
    this.onerror = function () {}; // noop
    this.onmessage = function () {}; // noop
    this.onclose = function () {}; // noop
    this.pollEndpoint = this.normalizeEndpoint(endPoint);
    this.readyState = SOCKET_STATES.connecting;

    this.poll();
  }

  _createClass(LongPoll, [{
    key: "normalizeEndpoint",
    value: function normalizeEndpoint(endPoint) {
      return endPoint.replace("ws://", "http://").replace("wss://", "https://").replace(new RegExp("(.*)\/" + TRANSPORTS.websocket), "$1/" + TRANSPORTS.longpoll);
    }
  }, {
    key: "endpointURL",
    value: function endpointURL() {
      return Ajax.appendParams(this.pollEndpoint, { token: this.token });
    }
  }, {
    key: "closeAndRetry",
    value: function closeAndRetry() {
      this.close();
      this.readyState = SOCKET_STATES.connecting;
    }
  }, {
    key: "ontimeout",
    value: function ontimeout() {
      this.onerror("timeout");
      this.closeAndRetry();
    }
  }, {
    key: "poll",
    value: function poll() {
      var _this10 = this;

      if (!(this.readyState === SOCKET_STATES.open || this.readyState === SOCKET_STATES.connecting)) {
        return;
      }

      Ajax.request("GET", this.endpointURL(), "application/json", null, this.timeout, this.ontimeout.bind(this), function (resp) {
        if (resp) {
          var status = resp.status,
              token = resp.token,
              messages = resp.messages;

          _this10.token = token;
        } else {
          var status = 0;
        }

        switch (status) {
          case 200:
            messages.forEach(function (msg) {
              return _this10.onmessage({ data: msg });
            });
            _this10.poll();
            break;
          case 204:
            _this10.poll();
            break;
          case 410:
            _this10.readyState = SOCKET_STATES.open;
            _this10.onopen();
            _this10.poll();
            break;
          case 0:
          case 500:
            _this10.onerror();
            _this10.closeAndRetry();
            break;
          default:
            throw "unhandled poll status " + status;
        }
      });
    }
  }, {
    key: "send",
    value: function send(body) {
      var _this11 = this;

      Ajax.request("POST", this.endpointURL(), "application/json", body, this.timeout, this.onerror.bind(this, "timeout"), function (resp) {
        if (!resp || resp.status !== 200) {
          _this11.onerror(resp && resp.status);
          _this11.closeAndRetry();
        }
      });
    }
  }, {
    key: "close",
    value: function close(code, reason) {
      this.readyState = SOCKET_STATES.closed;
      this.onclose();
    }
  }]);

  return LongPoll;
}();

var Ajax = exports.Ajax = function () {
  function Ajax() {
    _classCallCheck(this, Ajax);
  }

  _createClass(Ajax, null, [{
    key: "request",
    value: function request(method, endPoint, accept, body, timeout, ontimeout, callback) {
      if (window.XDomainRequest) {
        var req = new XDomainRequest(); // IE8, IE9
        this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback);
      } else {
        var _req = window.XMLHttpRequest ? new window.XMLHttpRequest() : // IE7+, Firefox, Chrome, Opera, Safari
        new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
        this.xhrRequest(_req, method, endPoint, accept, body, timeout, ontimeout, callback);
      }
    }
  }, {
    key: "xdomainRequest",
    value: function xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback) {
      var _this12 = this;

      req.timeout = timeout;
      req.open(method, endPoint);
      req.onload = function () {
        var response = _this12.parseJSON(req.responseText);
        callback && callback(response);
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      // Work around bug in IE9 that requires an attached onprogress handler
      req.onprogress = function () {};

      req.send(body);
    }
  }, {
    key: "xhrRequest",
    value: function xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback) {
      var _this13 = this;

      req.open(method, endPoint, true);
      req.timeout = timeout;
      req.setRequestHeader("Content-Type", accept);
      req.onerror = function () {
        callback && callback(null);
      };
      req.onreadystatechange = function () {
        if (req.readyState === _this13.states.complete && callback) {
          var response = _this13.parseJSON(req.responseText);
          callback(response);
        }
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      req.send(body);
    }
  }, {
    key: "parseJSON",
    value: function parseJSON(resp) {
      if (!resp || resp === "") {
        return null;
      }

      try {
        return JSON.parse(resp);
      } catch (e) {
        console && console.log("failed to parse JSON response", resp);
        return null;
      }
    }
  }, {
    key: "serialize",
    value: function serialize(obj, parentKey) {
      var queryStr = [];
      for (var key in obj) {
        if (!obj.hasOwnProperty(key)) {
          continue;
        }
        var paramKey = parentKey ? parentKey + "[" + key + "]" : key;
        var paramVal = obj[key];
        if ((typeof paramVal === "undefined" ? "undefined" : _typeof(paramVal)) === "object") {
          queryStr.push(this.serialize(paramVal, paramKey));
        } else {
          queryStr.push(encodeURIComponent(paramKey) + "=" + encodeURIComponent(paramVal));
        }
      }
      return queryStr.join("&");
    }
  }, {
    key: "appendParams",
    value: function appendParams(url, params) {
      if (Object.keys(params).length === 0) {
        return url;
      }

      var prefix = url.match(/\?/) ? "&" : "?";
      return "" + url + prefix + this.serialize(params);
    }
  }]);

  return Ajax;
}();

Ajax.states = { complete: 4 };

var Presence = exports.Presence = {
  syncState: function syncState(currentState, newState, onJoin, onLeave) {
    var _this14 = this;

    var state = this.clone(currentState);
    var joins = {};
    var leaves = {};

    this.map(state, function (key, presence) {
      if (!newState[key]) {
        leaves[key] = presence;
      }
    });
    this.map(newState, function (key, newPresence) {
      var currentPresence = state[key];
      if (currentPresence) {
        var newRefs = newPresence.metas.map(function (m) {
          return m.phx_ref;
        });
        var curRefs = currentPresence.metas.map(function (m) {
          return m.phx_ref;
        });
        var joinedMetas = newPresence.metas.filter(function (m) {
          return curRefs.indexOf(m.phx_ref) < 0;
        });
        var leftMetas = currentPresence.metas.filter(function (m) {
          return newRefs.indexOf(m.phx_ref) < 0;
        });
        if (joinedMetas.length > 0) {
          joins[key] = newPresence;
          joins[key].metas = joinedMetas;
        }
        if (leftMetas.length > 0) {
          leaves[key] = _this14.clone(currentPresence);
          leaves[key].metas = leftMetas;
        }
      } else {
        joins[key] = newPresence;
      }
    });
    return this.syncDiff(state, { joins: joins, leaves: leaves }, onJoin, onLeave);
  },
  syncDiff: function syncDiff(currentState, _ref2, onJoin, onLeave) {
    var joins = _ref2.joins,
        leaves = _ref2.leaves;

    var state = this.clone(currentState);
    if (!onJoin) {
      onJoin = function onJoin() {};
    }
    if (!onLeave) {
      onLeave = function onLeave() {};
    }

    this.map(joins, function (key, newPresence) {
      var currentPresence = state[key];
      state[key] = newPresence;
      if (currentPresence) {
        var _state$key$metas;

        (_state$key$metas = state[key].metas).unshift.apply(_state$key$metas, _toConsumableArray(currentPresence.metas));
      }
      onJoin(key, currentPresence, newPresence);
    });
    this.map(leaves, function (key, leftPresence) {
      var currentPresence = state[key];
      if (!currentPresence) {
        return;
      }
      var refsToRemove = leftPresence.metas.map(function (m) {
        return m.phx_ref;
      });
      currentPresence.metas = currentPresence.metas.filter(function (p) {
        return refsToRemove.indexOf(p.phx_ref) < 0;
      });
      onLeave(key, currentPresence, leftPresence);
      if (currentPresence.metas.length === 0) {
        delete state[key];
      }
    });
    return state;
  },
  list: function list(presences, chooser) {
    if (!chooser) {
      chooser = function chooser(key, pres) {
        return pres;
      };
    }

    return this.map(presences, function (key, presence) {
      return chooser(key, presence);
    });
  },


  // private

  map: function map(obj, func) {
    return Object.getOwnPropertyNames(obj).map(function (key) {
      return func(key, obj[key]);
    });
  },
  clone: function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};

/**
 *
 * Creates a timer that accepts a `timerCalc` function to perform
 * calculated timeout retries, such as exponential backoff.
 *
 * ## Examples
 *
 * ```javascript
 *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
 *      return [1000, 5000, 10000][tries - 1] || 10000
 *    })
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 *    reconnectTimer.scheduleTimeout() // fires after 5000
 *    reconnectTimer.reset()
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 * ```
 * @param {Function} callback
 * @param {Function} timerCalc
 */

var Timer = function () {
  function Timer(callback, timerCalc) {
    _classCallCheck(this, Timer);

    this.callback = callback;
    this.timerCalc = timerCalc;
    this.timer = null;
    this.tries = 0;
  }

  _createClass(Timer, [{
    key: "reset",
    value: function reset() {
      this.tries = 0;
      clearTimeout(this.timer);
    }

    /**
     * Cancels any previous scheduleTimeout and schedules callback
     */

  }, {
    key: "scheduleTimeout",
    value: function scheduleTimeout() {
      var _this15 = this;

      clearTimeout(this.timer);

      this.timer = setTimeout(function () {
        _this15.tries = _this15.tries + 1;
        _this15.callback();
      }, this.timerCalc(this.tries + 1));
    }
  }]);

  return Timer;
}();

})));
  })();
});

require.register("phoenix_html/priv/static/phoenix_html.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "phoenix_html");
  (function() {
    "use strict";

(function() {
  function buildHiddenInput(name, value) {
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    return input;
  }

  function handleLinkClick(link) {
    var message = link.getAttribute("data-confirm");
    if(message && !window.confirm(message)) {
        return;
    }

    var to = link.getAttribute("data-to"),
        method = buildHiddenInput("_method", link.getAttribute("data-method")),
        csrf = buildHiddenInput("_csrf_token", link.getAttribute("data-csrf")),
        form = document.createElement("form");

    form.method = (link.getAttribute("data-method") === "get") ? "get" : "post";
    form.action = to;
    form.style.display = "hidden";

    form.appendChild(csrf);
    form.appendChild(method);
    document.body.appendChild(form);
    form.submit();
  }

  window.addEventListener("click", function(e) {
    var element = e.target;

    while (element && element.getAttribute) {
      if(element.getAttribute("data-method")) {
        handleLinkClick(element);
        e.preventDefault();
        return false;
      } else {
        element = element.parentNode;
      }
    }
  }, false);
})();
  })();
});

require.register("process-nextick-args/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "process-nextick-args");
  (function() {
    'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}
  })();
});

require.register("process/browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "process");
  (function() {
    // shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };
  })();
});

require.register("readable-stream/duplex-browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    module.exports = require('./lib/_stream_duplex.js');
  })();
});

require.register("readable-stream/lib/_stream_duplex.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  processNextTick(cb, err);
};

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
  })();
});

require.register("readable-stream/lib/_stream_passthrough.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
  })();
});

require.register("readable-stream/lib/_stream_readable.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

// TODO(bmeurer): Change this back to const once hole checks are
// properly optimized away early in Ignition+TurboFan.
/*<replacement>*/
var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], self.emit.bind(self, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
  })();
});

require.register("readable-stream/lib/_stream_transform.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return stream.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er, data) {
      done(stream, er, data);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data !== null && data !== undefined) stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
  })();
});

require.register("readable-stream/lib/_stream_writable.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/
var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = _isUint8Array(chunk) && !state.objectMode;

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    processNextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    processNextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      processNextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
  })();
});

require.register("readable-stream/lib/internal/streams/BufferList.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    'use strict';

/*<replacement>*/

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();
  })();
});

require.register("readable-stream/lib/internal/streams/destroy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      processNextTick(emitErrorNT, this, err);
    }
    return;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      processNextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
  })();
});

require.register("readable-stream/lib/internal/streams/stream-browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    module.exports = require('events').EventEmitter;
  })();
});

require.register("readable-stream/passthrough.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    module.exports = require('./readable').PassThrough
  })();
});

require.register("readable-stream/readable-browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');
  })();
});

require.register("readable-stream/transform.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    module.exports = require('./readable').Transform
  })();
});

require.register("readable-stream/writable-browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    module.exports = require('./lib/_stream_writable.js');
  })();
});

require.register("resemblejs/resemble.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "resemblejs");
  (function() {
    /*
James Cryer / Huddle
URL: https://github.com/Huddle/Resemble.js
*/

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		root.resemble = factory();
	}
}(this, function () {
	'use strict';

	var pixelTransparency = 1;

	var errorPixelColor = { // Color for Error Pixels. Between 0 and 255.
		red: 255,
		green: 0,
		blue: 255,
		alpha: 255
	};

	var targetPix = {r: 0, g: 0, b: 0, a: 0}; // isAntialiased

	function colorsDistance(c1, c2){
		return (Math.abs(c1.r - c2.r) + Math.abs(c1.g - c2.g) + Math.abs(c1.b - c2.b))/3;
	}

	function withinBoundingBox(x, y, width, height) {
		if (!boundingBox) {
			return true;
		}

        return x > (boundingBox.left || 0) &&
            x < (boundingBox.right || width) &&
            y > (boundingBox.top || 0) &&
            y < (boundingBox.bottom || height);
	}

	var errorPixelTransform = {
		flat: function (px, offset, d1, d2) {
			px[offset] = errorPixelColor.red;
			px[offset + 1] = errorPixelColor.green;
			px[offset + 2] = errorPixelColor.blue;
			px[offset + 3] = errorPixelColor.alpha;
		},
		movement: function (px, offset, d1, d2) {
			px[offset] = ((d2.r * (errorPixelColor.red / 255)) + errorPixelColor.red) / 2;
			px[offset + 1] = ((d2.g * (errorPixelColor.green / 255)) + errorPixelColor.green) / 2;
			px[offset + 2] = ((d2.b * (errorPixelColor.blue / 255)) + errorPixelColor.blue) / 2;
			px[offset + 3] = d2.a;
		},
		flatDifferenceIntensity: function (px, offset, d1, d2) {
			px[offset] = errorPixelColor.red;
			px[offset + 1] = errorPixelColor.green;
			px[offset + 2] = errorPixelColor.blue;
			px[offset + 3] = colorsDistance(d1, d2);
		},
		movementDifferenceIntensity: function (px, offset, d1, d2) {
			var ratio = colorsDistance(d1, d2) / 255 * 0.8;

			px[offset] = ((1 - ratio) * (d2.r * (errorPixelColor.red / 255)) + ratio * errorPixelColor.red);
			px[offset + 1] = ((1 - ratio) * (d2.g * (errorPixelColor.green / 255)) + ratio * errorPixelColor.green);
			px[offset + 2] = ((1 - ratio) * (d2.b * (errorPixelColor.blue / 255)) + ratio * errorPixelColor.blue);
			px[offset + 3] = d2.a;
		}
	};

	var errorPixel = errorPixelTransform.flat;
	var boundingBox;
	var largeImageThreshold = 1200;
	var useCrossOrigin = true;
	var document = typeof window != "undefined" ? window.document : {
		createElement: function() {
			// This will work as long as only createElement is used on window.document
			var Canvas = require('canvas');
			return new Canvas();
		}
	};

	var resemble = function( fileData ){

		var data = {};
		var images = [];
		var updateCallbackArray = [];

		var tolerance = { // between 0 and 255
			red: 16,
			green: 16,
			blue: 16,
			alpha: 16,
			minBrightness: 16,
			maxBrightness: 240
		};

		var ignoreAntialiasing = false;
		var ignoreColors = false;
		var scaleToSameSize = false;

		function triggerDataUpdate(){
			var len = updateCallbackArray.length;
			var i;
			for(i=0;i<len;i++){
				if (typeof updateCallbackArray[i] === 'function'){
					updateCallbackArray[i](data);
				}
			}
		}

		function loop(w, h, callback){
			var x,y;

			for (x=0;x<w;x++){
				for (y=0;y<h;y++){
					callback(x, y);
				}
			}
		}

		function parseImage(sourceImageData, width, height){

			var pixelCount = 0;
			var redTotal = 0;
			var greenTotal = 0;
			var blueTotal = 0;
			var alphaTotal = 0;
			var brightnessTotal = 0;
			var whiteTotal = 0;
			var blackTotal = 0;

			loop(width, height, function(horizontalPos, verticalPos){
				var offset = (verticalPos*width + horizontalPos) * 4;
				var red = sourceImageData[offset];
				var green = sourceImageData[offset + 1];
				var blue = sourceImageData[offset + 2];
				var alpha = sourceImageData[offset + 3];
				var brightness = getBrightness(red,green,blue);

				if (red == green && red == blue && alpha) {
					if (red == 0) {
						blackTotal++
					} else if (red == 255) {
						whiteTotal++
					}
				}

				pixelCount++;

				redTotal += red / 255 * 100;
				greenTotal += green / 255 * 100;
				blueTotal += blue / 255 * 100;
				alphaTotal += (255 - alpha) / 255 * 100;
				brightnessTotal += brightness / 255 * 100;
			});

			data.red = Math.floor(redTotal / pixelCount);
			data.green = Math.floor(greenTotal / pixelCount);
			data.blue = Math.floor(blueTotal / pixelCount);
			data.alpha = Math.floor(alphaTotal / pixelCount);
			data.brightness = Math.floor(brightnessTotal / pixelCount);
			data.white = Math.floor(whiteTotal / pixelCount * 100);
			data.black = Math.floor(blackTotal / pixelCount * 100);

			triggerDataUpdate();
		}

		function loadImageData( fileData, callback ){
			var fileReader;
			var hiddenImage;
			if (typeof Image !== 'undefined') {
				hiddenImage = new Image();
			} else {
				var CanvasImage = require('canvas').Image;
				hiddenImage = new CanvasImage();
				hiddenImage.setAttribute = function setAttribute() { };
			}


			if(useCrossOrigin) {
				hiddenImage.setAttribute('crossorigin', 'anonymous');
			}

			hiddenImage.onerror = function () {
				hiddenImage.onerror = null; //fixes pollution between calls
				images.push({ error : "Image load error."});
				callback();
			};

			hiddenImage.onload = function() {
				hiddenImage.onload = null; //fixes pollution between calls

				var hiddenCanvas =  document.createElement('canvas');
				var imageData;

				// don't assign to hiddenImage, see https://github.com/Huddle/Resemble.js/pull/87/commits/300d43352a2845aad289b254bfbdc7cd6a37e2d7
				var width = hiddenImage.width;
				var height = hiddenImage.height;

				if( scaleToSameSize && images.length == 1 ){
					width   = images[0].width;
					height  = images[0].height;
				}

				hiddenCanvas.width = width;
				hiddenCanvas.height = height;

				hiddenCanvas.getContext('2d').drawImage(hiddenImage, 0, 0, width, height);
				imageData = hiddenCanvas.getContext('2d').getImageData(0, 0, width, height);

				images.push(imageData);

				callback(imageData, width, height);
			};

			if (typeof fileData === 'string') {
				hiddenImage.src = fileData;
				if (hiddenImage.complete && hiddenImage.naturalWidth > 0) {
					hiddenImage.onload();
				}
			} else if (typeof fileData.data !== 'undefined'
					&& typeof fileData.width === 'number'
					&& typeof fileData.height === 'number') {

				images.push(fileData);

				callback(fileData, fileData.width, fileData.height);
			} else if (typeof Buffer !== 'undefined' && fileData instanceof Buffer){
				// If we have Buffer, assume we're on Node+Canvas and its supported
				hiddenImage.src = fileData;
			} else {
				fileReader = new FileReader();
				fileReader.onload = function (event) {
					hiddenImage.src = event.target.result;
				};
				fileReader.readAsDataURL(fileData);
			}
		}

		function isColorSimilar(a, b, color){

			var absDiff = Math.abs(a - b);

			if(typeof a === 'undefined'){
				return false;
			}
			if(typeof b === 'undefined'){
				return false;
			}

			if(a === b){
				return true;
			} else if ( absDiff < tolerance[color] ) {
				return true;
			} else {
				return false;
			}
		}

		function isPixelBrightnessSimilar(d1, d2){
			var alpha = isColorSimilar(d1.a, d2.a, 'alpha');
			var brightness = isColorSimilar(d1.brightness, d2.brightness, 'minBrightness');
			return brightness && alpha;
		}

		function getBrightness(r,g,b){
			return 0.3*r + 0.59*g + 0.11*b;
		}

		function isRGBSame(d1,d2){
			var red = d1.r === d2.r;
			var green = d1.g === d2.g;
			var blue = d1.b === d2.b;
			return red && green && blue;
		}

		function isRGBSimilar(d1, d2){
			var red = isColorSimilar(d1.r,d2.r,'red');
			var green = isColorSimilar(d1.g,d2.g,'green');
			var blue = isColorSimilar(d1.b,d2.b,'blue');
			var alpha = isColorSimilar(d1.a, d2.a, 'alpha');

			return red && green && blue && alpha;
		}

		function isContrasting(d1, d2){
			return Math.abs(d1.brightness - d2.brightness) > tolerance.maxBrightness;
		}

		function getHue(r,g,b){

			r = r / 255;
			g = g / 255;
			b = b / 255;
			var max = Math.max(r, g, b), min = Math.min(r, g, b);
			var h;
			var d;

			if (max == min){
				h = 0; // achromatic
			} else{
				d = max - min;
				switch(max){
					case r: h = (g - b) / d + (g < b ? 6 : 0); break;
					case g: h = (b - r) / d + 2; break;
					case b: h = (r - g) / d + 4; break;
				}
				h /= 6;
			}

			return h;
		}

		function isAntialiased(sourcePix, data, cacheSet, verticalPos, horizontalPos, width){
			var offset;
			var distance = 1;
			var i;
			var j;
			var hasHighContrastSibling = 0;
			var hasSiblingWithDifferentHue = 0;
			var hasEquivalentSibling = 0;

			addHueInfo(sourcePix);

			for (i = distance*-1; i <= distance; i++){
				for (j = distance*-1; j <= distance; j++){

					if(i===0 && j===0){
						// ignore source pixel
					} else {

						offset = ((verticalPos+j)*width + (horizontalPos+i)) * 4;

						if(!getPixelInfo(targetPix , data, offset, cacheSet)){
							continue;
						}

						addBrightnessInfo(targetPix);
						addHueInfo(targetPix);

						if( isContrasting(sourcePix, targetPix) ){
							hasHighContrastSibling++;
						}

						if( isRGBSame(sourcePix,targetPix) ){
							hasEquivalentSibling++;
						}

						if( Math.abs(targetPix.h - sourcePix.h) > 0.3 ){
							hasSiblingWithDifferentHue++;
						}

						if( hasSiblingWithDifferentHue > 1 || hasHighContrastSibling > 1){
							return true;
						}
					}
				}
			}

			if(hasEquivalentSibling < 2){
				return true;
			}

			return false;
		}

		function copyPixel(px, offset, data){
			px[offset] = data.r; //r
			px[offset + 1] = data.g; //g
			px[offset + 2] = data.b; //b
			px[offset + 3] = data.a * pixelTransparency; //a
		}

		function copyGrayScalePixel(px, offset, data){
			px[offset] = data.brightness; //r
			px[offset + 1] = data.brightness; //g
			px[offset + 2] = data.brightness; //b
			px[offset + 3] = data.a * pixelTransparency; //a
		}

		function getPixelInfo(dst, data, offset, cacheSet) {
			if (data.length > offset) {
				dst.r = data[offset];
				dst.g = data[offset + 1];
				dst.b = data[offset + 2];
				dst.a = data[offset + 3];

				return true;
			}

			return false;
		}

		function addBrightnessInfo(data){
			data.brightness = getBrightness(data.r,data.g,data.b); // 'corrected' lightness
		}

		function addHueInfo(data){
			data.h = getHue(data.r,data.g,data.b);
		}

		function analyseImages(img1, img2, width, height){

			var hiddenCanvas = document.createElement('canvas');

			var data1 = img1.data;
			var data2 = img2.data;

			hiddenCanvas.width = width;
			hiddenCanvas.height = height;

			var context = hiddenCanvas.getContext('2d');
			var imgd = context.createImageData(width,height);
			var targetPix = imgd.data;

			var mismatchCount = 0;
			var diffBounds = {
				top: height,
				left: width,
				bottom: 0,
				right: 0
			};
			var updateBounds = function(x, y) {
				diffBounds.left = Math.min(x, diffBounds.left);
				diffBounds.right = Math.max(x, diffBounds.right);
				diffBounds.top = Math.min(y, diffBounds.top);
				diffBounds.bottom = Math.max(y, diffBounds.bottom);
			};

			var time = Date.now();

			var skip;

			if(!!largeImageThreshold && ignoreAntialiasing && (width > largeImageThreshold || height > largeImageThreshold)){
				skip = 6;
			}

			var pixel1 = {r: 0, g: 0, b: 0, a: 0};
			var pixel2 = { r: 0, g: 0, b: 0, a: 0 };

			loop(width, height, function(horizontalPos, verticalPos){

				if(skip){ // only skip if the image isn't small
					if(verticalPos % skip === 0 || horizontalPos % skip === 0){
						return;
					}
				}

				var offset = (verticalPos*width + horizontalPos) * 4;
				var isWithinBoundingBox = withinBoundingBox(horizontalPos, verticalPos, width, height);

				if (!getPixelInfo(pixel1, data1, offset, 1) || !getPixelInfo(pixel2, data2, offset, 2)) {
					return;
				}

				if (ignoreColors){

					addBrightnessInfo(pixel1);
					addBrightnessInfo(pixel2);

					if( isPixelBrightnessSimilar(pixel1, pixel2) || !isWithinBoundingBox ){
						copyGrayScalePixel(targetPix, offset, pixel2);
					} else {
						errorPixel(targetPix, offset, pixel1, pixel2);
						mismatchCount++;
						updateBounds(horizontalPos, verticalPos);
					}
					return;
				}

				if( isRGBSimilar(pixel1, pixel2)  || !isWithinBoundingBox ){
					copyPixel(targetPix, offset, pixel1, pixel2);

				} else if( ignoreAntialiasing && (
						addBrightnessInfo(pixel1), // jit pixel info augmentation looks a little weird, sorry.
						addBrightnessInfo(pixel2),
						isAntialiased(pixel1, data1, 1, verticalPos, horizontalPos, width) ||
						isAntialiased(pixel2, data2, 2, verticalPos, horizontalPos, width)
					)){

					if( isPixelBrightnessSimilar(pixel1, pixel2) || !isWithinBoundingBox ){
						copyGrayScalePixel(targetPix, offset, pixel2);
					} else {
						errorPixel(targetPix, offset, pixel1, pixel2);
						mismatchCount++;
						updateBounds(horizontalPos, verticalPos);
					}
				} else {
					errorPixel(targetPix, offset, pixel1, pixel2);
					mismatchCount++;
					updateBounds(horizontalPos, verticalPos);
				}

			});

			data.rawMisMatchPercentage = (mismatchCount / (height*width) * 100);
			data.misMatchPercentage = data.rawMisMatchPercentage.toFixed(2);
			data.diffBounds = diffBounds;
			data.analysisTime = Date.now() - time;

			data.getImageDataUrl = function(text){
				var barHeight = 0;

				if(text){
					barHeight = addLabel(text,context,hiddenCanvas);
				}

				context.putImageData(imgd, 0, barHeight);

				return hiddenCanvas.toDataURL("image/png");
			};

			if (hiddenCanvas.toBuffer) {
				data.getBuffer = function() {
					context.putImageData(imgd, 0, 0);
					return hiddenCanvas.toBuffer();
				}
			}
		}

		function addLabel(text, context, hiddenCanvas){
			var textPadding = 2;

			context.font = '12px sans-serif';

			var textWidth = context.measureText(text).width + textPadding*2;
			var barHeight = 22;

			if(textWidth > hiddenCanvas.width){
				hiddenCanvas.width = textWidth;
			}

			hiddenCanvas.height += barHeight;

			context.fillStyle = "#666";
			context.fillRect(0,0,hiddenCanvas.width,barHeight -4);
			context.fillStyle = "#fff";
			context.fillRect(0,barHeight -4,hiddenCanvas.width, 4);

			context.fillStyle = "#fff";
			context.textBaseline = "top";
			context.font = '12px sans-serif';
			context.fillText(text, textPadding, 1);

			return barHeight;
		}

		function normalise(img, w, h){
			var c;
			var context;

			if(img.height < h || img.width < w){
				c = document.createElement('canvas');
				c.width = w;
				c.height = h;
				context = c.getContext('2d');
				context.putImageData(img, 0, 0);
				return context.getImageData(0, 0, w, h);
			}

			return img;
		}

		function compare(one, two){

			function onceWeHaveBoth(){
				var width;
				var height;
				if(images.length === 2){
					if( images[0].error || images[1].error ){
						data = {};
						data.error = images[0].error ?  images[0].error : images[1].error;
						triggerDataUpdate();
						return;
					}
					width = images[0].width > images[1].width ? images[0].width : images[1].width;
					height = images[0].height > images[1].height ? images[0].height : images[1].height;

					if( (images[0].width === images[1].width) && (images[0].height === images[1].height) ){
						data.isSameDimensions = true;
					} else {
						data.isSameDimensions = false;
					}

					data.dimensionDifference = { width: images[0].width - images[1].width, height: images[0].height - images[1].height };

					analyseImages( normalise(images[0],width, height), normalise(images[1],width, height), width, height);

					triggerDataUpdate();
				}
			}

			images = [];
			loadImageData(one, onceWeHaveBoth);
			loadImageData(two, onceWeHaveBoth);
		}

		function getCompareApi(param){

			var secondFileData,
				hasMethod = typeof param === 'function';

			if( !hasMethod ){
				// assume it's file data
				secondFileData = param;
			}

			var self = {
				scaleToSameSize: function(){
					scaleToSameSize = true;

					if(hasMethod) { param(); }
					return self;
				},
				useOriginalSize: function(){
					scaleToSameSize = false;

					if(hasMethod) { param(); }
					return self;
				},
				ignoreNothing: function(){

					tolerance.red = 0;
					tolerance.green = 0;
					tolerance.blue = 0;
					tolerance.alpha = 0;
					tolerance.minBrightness = 0;
					tolerance.maxBrightness = 255;

					ignoreAntialiasing = false;
					ignoreColors = false;

					if(hasMethod) { param(); }
					return self;
				},
				ignoreLess: function(){

					tolerance.red = 16;
					tolerance.green = 16;
					tolerance.blue = 16;
					tolerance.alpha = 16;
					tolerance.minBrightness = 16;
					tolerance.maxBrightness = 240;

					ignoreAntialiasing = false;
					ignoreColors = false;

					if(hasMethod) { param(); }
					return self;
				},
				ignoreAntialiasing: function(){

					tolerance.red = 32;
					tolerance.green = 32;
					tolerance.blue = 32;
					tolerance.alpha = 32;
					tolerance.minBrightness = 64;
					tolerance.maxBrightness = 96;

					ignoreAntialiasing = true;
					ignoreColors = false;

					if(hasMethod) { param(); }
					return self;
				},
				ignoreColors: function(){

					tolerance.alpha = 16;
					tolerance.minBrightness = 16;
					tolerance.maxBrightness = 240;

					ignoreAntialiasing = false;
					ignoreColors = true;

					if(hasMethod) { param(); }
					return self;
				},
				repaint: function(){
					if(hasMethod) { param(); }
					return self;
				},
				onComplete: function( callback ){

					updateCallbackArray.push(callback);

					var wrapper = function(){
						compare(fileData, secondFileData);
					};

					wrapper();

					return getCompareApi(wrapper);
				}
			};

			return self;
		}

		return {
			onComplete: function( callback ){
				updateCallbackArray.push(callback);
				loadImageData(fileData, function(imageData, width, height){
					parseImage(imageData.data, width, height);
				});
			},
			compareTo: function(secondFileData){
				return getCompareApi(secondFileData);
			}
		};

	};

	resemble.outputSettings = function(options){
		var key;
		var undefined;

		if(options.errorColor){
			for (key in options.errorColor) {
				errorPixelColor[key] = options.errorColor[key] === undefined ? errorPixelColor[key] : options.errorColor[key];
			}
		}

		if(options.errorType && errorPixelTransform[options.errorType] ){
			errorPixel = errorPixelTransform[options.errorType];
		}

		if(options.errorPixel && typeof options.errorPixel === "function") {
			errorPixel = options.errorPixel;
		}

		pixelTransparency = isNaN(Number(options.transparency)) ? pixelTransparency : options.transparency;

		if (options.largeImageThreshold !== undefined) {
			largeImageThreshold = options.largeImageThreshold;
		}

		if (options.useCrossOrigin !== undefined) {
			useCrossOrigin = options.useCrossOrigin;
		}

		if (options.boundingBox !== undefined) {
			boundingBox = options.boundingBox;
		}

		return this;
	};

	return resemble;
}));
  })();
});

require.register("safe-buffer/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "safe-buffer");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    /* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}
  })();
});

require.register("stream-browserify/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "stream-browserify");
  (function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};
  })();
});

require.register("string_decoder/lib/string_decoder.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "string_decoder");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    'use strict';

var Buffer = require('safe-buffer').Buffer;

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return -1;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// UTF-8 replacement characters ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd'.repeat(p);
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd'.repeat(p + 1);
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd'.repeat(p + 2);
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character for each buffered byte of a (partial)
// character needs to be added to the output.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd'.repeat(this.lastTotal - this.lastNeed);
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
  })();
});

require.register("tcomb/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    /*! @preserve
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2016 Giulio Canti
 *
 */

// core
var t = require('./lib/assert');

// types
t.Any = require('./lib/Any');
t.Array = require('./lib/Array');
t.Boolean = require('./lib/Boolean');
t.Date = require('./lib/Date');
t.Error = require('./lib/Error');
t.Function = require('./lib/Function');
t.Nil = require('./lib/Nil');
t.Number = require('./lib/Number');
t.Object = require('./lib/Object');
t.RegExp = require('./lib/RegExp');
t.String = require('./lib/String');

// short alias are deprecated
t.Arr = t.Array;
t.Bool = t.Boolean;
t.Dat = t.Date;
t.Err = t.Error;
t.Func = t.Function;
t.Num = t.Number;
t.Obj = t.Object;
t.Re = t.RegExp;
t.Str = t.String;

// combinators
t.dict = require('./lib/dict');
t.declare = require('./lib/declare');
t.enums = require('./lib/enums');
t.irreducible = require('./lib/irreducible');
t.list = require('./lib/list');
t.maybe = require('./lib/maybe');
t.refinement = require('./lib/refinement');
t.struct = require('./lib/struct');
t.tuple = require('./lib/tuple');
t.union = require('./lib/union');
t.func = require('./lib/func');
t.intersection = require('./lib/intersection');
t.subtype = t.refinement;

// functions
t.assert = t;
t.update = require('./lib/update');
t.mixin = require('./lib/mixin');
t.isType = require('./lib/isType');
t.is = require('./lib/is');
t.getTypeName = require('./lib/getTypeName');
t.match = require('./lib/match');

module.exports = t;
  })();
});

require.register("tcomb/lib/Any.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var irreducible = require('./irreducible');

module.exports = irreducible('Any', function () { return true; });
  })();
});

require.register("tcomb/lib/Array.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var irreducible = require('./irreducible');
var isArray = require('./isArray');

module.exports = irreducible('Array', isArray);
  })();
});

require.register("tcomb/lib/Boolean.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var irreducible = require('./irreducible');
var isBoolean = require('./isBoolean');

module.exports = irreducible('Boolean', isBoolean);
  })();
});

require.register("tcomb/lib/Date.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var irreducible = require('./irreducible');

module.exports = irreducible('Date', function (x) { return x instanceof Date; });
  })();
});

require.register("tcomb/lib/Error.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var irreducible = require('./irreducible');

module.exports = irreducible('Error', function (x) { return x instanceof Error; });
  })();
});

require.register("tcomb/lib/Function.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var irreducible = require('./irreducible');
var isFunction = require('./isFunction');

module.exports = irreducible('Function', isFunction);
  })();
});

require.register("tcomb/lib/Nil.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var irreducible = require('./irreducible');
var isNil = require('./isNil');

module.exports = irreducible('Nil', isNil);
  })();
});

require.register("tcomb/lib/Number.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var irreducible = require('./irreducible');
var isNumber = require('./isNumber');

module.exports = irreducible('Number', isNumber);
  })();
});

require.register("tcomb/lib/Object.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var irreducible = require('./irreducible');
var isObject = require('./isObject');

module.exports = irreducible('Object', isObject);
  })();
});

require.register("tcomb/lib/RegExp.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var irreducible = require('./irreducible');

module.exports = irreducible('RegExp', function (x) { return x instanceof RegExp; });
  })();
});

require.register("tcomb/lib/String.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var irreducible = require('./irreducible');
var isString = require('./isString');

module.exports = irreducible('String', isString);
  })();
});

require.register("tcomb/lib/assert.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var isFunction = require('./isFunction');
var isNil = require('./isNil');
var fail = require('./fail');
var stringify = require('./stringify');

function assert(guard, message) {
  if (guard !== true) {
    if (isFunction(message)) { // handle lazy messages
      message = message();
    }
    else if (isNil(message)) { // use a default message
      message = 'Assert failed (turn on "Pause on exceptions" in your Source panel)';
    }
    assert.fail(message);
  }
}

assert.fail = fail;
assert.stringify = stringify;

module.exports = assert;
  })();
});

require.register("tcomb/lib/create.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var isType = require('./isType');
var isStruct = require('./isStruct');
var getFunctionName = require('./getFunctionName');
var assert = require('./assert');
var stringify = require('./stringify');

// creates an instance of a type, handling the optional new operator
module.exports = function create(type, value, path) {
  if (isType(type)) {
    // for structs the new operator is allowed
    return isStruct(type) ? new type(value, path) : type(value, path);
  }

  if ('development' !== 'production') {
    // here type should be a class constructor and value some instance, just check membership and return the value
    path = path || [getFunctionName(type)];
    assert(value instanceof type, function () { return 'Invalid value ' + stringify(value) + ' supplied to ' + path.join('/'); });
  }

  return value;
};
  })();
});

require.register("tcomb/lib/declare.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isTypeName = require('./isTypeName');
var isType = require('./isType');
var isNil = require('./isNil');
var mixin = require('./mixin');
var getTypeName = require('./getTypeName');

// All the .declare-d types should be clearly different from each other thus they should have
// different names when a name was not explicitly provided.
var nextDeclareUniqueId = 1;

module.exports = function declare(name) {
  if ('development' !== 'production') {
    assert(isTypeName(name), function () { return 'Invalid argument name ' + name + ' supplied to declare([name]) (expected a string)'; });
  }

  var type;

  function Declare(value, path) {
    if ('development' !== 'production') {
      assert(!isNil(type), function () { return 'Type declared but not defined, don\'t forget to call .define on every declared type'; });
    }
    return type(value, path);
  }

  Declare.define = function (spec) {
    if ('development' !== 'production') {
      assert(isType(spec), function () { return 'Invalid argument type ' + assert.stringify(spec) +  ' supplied to define(type) (expected a type)'; });
      assert(isNil(type), function () { return 'Declare.define(type) can only be invoked once'; });
      assert(isNil(spec.meta.name) && Object.keys(spec.prototype).length === 0, function () { return 'Invalid argument type ' + assert.stringify(spec) + ' supplied to define(type) (expected a fresh, unnamed type)'; });
    }

    type = spec;
    mixin(Declare, type, true); // true because it overwrites Declare.displayName
    if (name) {
      type.displayName = Declare.displayName = name;
      Declare.meta.name = name;
    }
    // ensure identity is still false
    Declare.meta.identity = false;
    Declare.prototype = type.prototype;
    return Declare;
  };

  Declare.displayName = name || ( getTypeName(Declare) + "$" + nextDeclareUniqueId++ );
  // in general I can't say if this type will be an identity, for safety setting to false
  Declare.meta = { identity: false };
  Declare.prototype = null;
  return Declare;
};
  })();
});

require.register("tcomb/lib/dict.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isTypeName = require('./isTypeName');
var isFunction = require('./isFunction');
var getTypeName = require('./getTypeName');
var isIdentity = require('./isIdentity');
var isObject = require('./isObject');
var create = require('./create');
var is = require('./is');

function getDefaultName(domain, codomain) {
  return '{[key: ' + getTypeName(domain) + ']: ' + getTypeName(codomain) + '}';
}

function dict(domain, codomain, name) {

  if ('development' !== 'production') {
    assert(isFunction(domain), function () { return 'Invalid argument domain ' + assert.stringify(domain) + ' supplied to dict(domain, codomain, [name]) combinator (expected a type)'; });
    assert(isFunction(codomain), function () { return 'Invalid argument codomain ' + assert.stringify(codomain) + ' supplied to dict(domain, codomain, [name]) combinator (expected a type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to dict(domain, codomain, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(domain, codomain);
  var domainNameCache = getTypeName(domain);
  var codomainNameCache = getTypeName(codomain);
  var identity = isIdentity(domain) && isIdentity(codomain);

  function Dict(value, path) {

    if ('development' === 'production') {
      if (identity) {
        return value; // just trust the input if elements must not be hydrated
      }
    }

    if ('development' !== 'production') {
      path = path || [displayName];
      assert(isObject(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/'); });
    }

    var idempotent = true; // will remain true if I can reutilise the input
    var ret = {}; // make a temporary copy, will be discarded if idempotent remains true
    for (var k in value) {
      if (value.hasOwnProperty(k)) {
        k = create(domain, k, ( 'development' !== 'production' ? path.concat(domainNameCache) : null ));
        var actual = value[k];
        var instance = create(codomain, actual, ( 'development' !== 'production' ? path.concat(k + ': ' + codomainNameCache) : null ));
        idempotent = idempotent && ( actual === instance );
        ret[k] = instance;
      }
    }

    if (idempotent) { // implements idempotency
      ret = value;
    }

    if ('development' !== 'production') {
      Object.freeze(ret);
    }

    return ret;
  }

  Dict.meta = {
    kind: 'dict',
    domain: domain,
    codomain: codomain,
    name: name,
    identity: identity
  };

  Dict.displayName = displayName;

  Dict.is = function (x) {
    if (!isObject(x)) {
      return false;
    }
    for (var k in x) {
      if (x.hasOwnProperty(k)) {
        if (!is(k, domain) || !is(x[k], codomain)) {
          return false;
        }
      }
    }
    return true;
  };

  Dict.update = function (instance, patch) {
    return Dict(assert.update(instance, patch));
  };

  return Dict;
}

dict.getDefaultName = getDefaultName;
module.exports = dict;
  })();
});

require.register("tcomb/lib/enums.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isTypeName = require('./isTypeName');
var forbidNewOperator = require('./forbidNewOperator');
var isString = require('./isString');
var isObject = require('./isObject');

function getDefaultName(map) {
  return Object.keys(map).map(function (k) { return assert.stringify(k); }).join(' | ');
}

function enums(map, name) {

  if ('development' !== 'production') {
    assert(isObject(map), function () { return 'Invalid argument map ' + assert.stringify(map) + ' supplied to enums(map, [name]) combinator (expected a dictionary of String -> String | Number)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to enums(map, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(map);

  function Enums(value, path) {

    if ('development' !== 'production') {
      forbidNewOperator(this, Enums);
      path = path || [displayName];
      assert(Enums.is(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/') + ' (expected one of ' + assert.stringify(Object.keys(map)) + ')'; });
    }

    return value;
  }

  Enums.meta = {
    kind: 'enums',
    map: map,
    name: name,
    identity: true
  };

  Enums.displayName = displayName;

  Enums.is = function (x) {
    return map.hasOwnProperty(x);
  };

  return Enums;
}

enums.of = function (keys, name) {
  keys = isString(keys) ? keys.split(' ') : keys;
  var value = {};
  keys.forEach(function (k) {
    value[k] = k;
  });
  return enums(value, name);
};

enums.getDefaultName = getDefaultName;
module.exports = enums;
  })();
});

require.register("tcomb/lib/fail.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    module.exports = function fail(message) {
  throw new TypeError('[tcomb] ' + message);
};
  })();
});

require.register("tcomb/lib/forbidNewOperator.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var getTypeName = require('./getTypeName');

module.exports = function forbidNewOperator(x, type) {
  assert(!(x instanceof type), function () { return 'Cannot use the new operator to instantiate the type ' + getTypeName(type); });
};
  })();
});

require.register("tcomb/lib/func.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isTypeName = require('./isTypeName');
var FunctionType = require('./Function');
var isArray = require('./isArray');
var list = require('./list');
var isObject = require('./isObject');
var create = require('./create');
var isNil = require('./isNil');
var isBoolean = require('./isBoolean');
var tuple = require('./tuple');
var getFunctionName = require('./getFunctionName');
var getTypeName = require('./getTypeName');

function getDefaultName(domain, codomain) {
  return '(' + domain.map(getTypeName).join(', ') + ') => ' + getTypeName(codomain);
}

function isInstrumented(f) {
  return FunctionType.is(f) && isObject(f.instrumentation);
}

function func(domain, codomain, name) {

  domain = isArray(domain) ? domain : [domain]; // handle handy syntax for unary functions

  if ('development' !== 'production') {
    assert(list(FunctionType).is(domain), function () { return 'Invalid argument domain ' + assert.stringify(domain) + ' supplied to func(domain, codomain, [name]) combinator (expected an array of types)'; });
    assert(FunctionType.is(codomain), function () { return 'Invalid argument codomain ' + assert.stringify(codomain) + ' supplied to func(domain, codomain, [name]) combinator (expected a type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to func(domain, codomain, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(domain, codomain);

  function FuncType(value, curried) {

    if (!isInstrumented(value)) { // automatically instrument the function
      return FuncType.of(value, curried);
    }

    if ('development' !== 'production') {
      assert(FuncType.is(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + displayName; });
    }

    return value;
  }

  FuncType.meta = {
    kind: 'func',
    domain: domain,
    codomain: codomain,
    name: name,
    identity: true
  };

  FuncType.displayName = displayName;

  FuncType.is = function (x) {
    return isInstrumented(x) &&
      x.instrumentation.domain.length === domain.length &&
      x.instrumentation.domain.every(function (type, i) {
        return type === domain[i];
      }) &&
      x.instrumentation.codomain === codomain;
  };

  FuncType.of = function (f, curried) {

    if ('development' !== 'production') {
      assert(FunctionType.is(f), function () { return 'Invalid argument f supplied to func.of ' + displayName + ' (expected a function)'; });
      assert(isNil(curried) || isBoolean(curried), function () { return 'Invalid argument curried ' + assert.stringify(curried) + ' supplied to func.of ' + displayName + ' (expected a boolean)'; });
    }

    if (FuncType.is(f)) { // makes FuncType.of idempotent
      return f;
    }

    function fn() {
      var args = Array.prototype.slice.call(arguments);
      var len = curried ?
        args.length :
        domain.length;
      var argsType = tuple(domain.slice(0, len));

      args = argsType(args); // type check arguments

      if (len === domain.length) {
        return create(codomain, f.apply(this, args));
      }
      else {
        var g = Function.prototype.bind.apply(f, [this].concat(args));
        var newdomain = func(domain.slice(len), codomain);
        return newdomain.of(g, curried);
      }
    }

    fn.instrumentation = {
      domain: domain,
      codomain: codomain,
      f: f
    };

    fn.displayName = getFunctionName(f);

    return fn;

  };

  return FuncType;

}

func.getDefaultName = getDefaultName;
module.exports = func;
  })();
});

require.register("tcomb/lib/getFunctionName.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    module.exports = function getFunctionName(f) {
  return f.displayName || f.name || '<function' + f.length + '>';
};
  })();
});

require.register("tcomb/lib/getTypeName.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var isType = require('./isType');
var getFunctionName = require('./getFunctionName');

module.exports = function getTypeName(constructor) {
  if (isType(constructor)) {
    return constructor.displayName;
  }
  return getFunctionName(constructor);
};
  })();
});

require.register("tcomb/lib/intersection.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isTypeName = require('./isTypeName');
var isFunction = require('./isFunction');
var isArray = require('./isArray');
var forbidNewOperator = require('./isIdentity');
var is = require('./is');
var getTypeName = require('./getTypeName');

function getDefaultName(types) {
  return types.map(getTypeName).join(' & ');
}

function intersection(types, name) {

  if ('development' !== 'production') {
    assert(isArray(types) && types.every(isFunction) && types.length >= 2, function () { return 'Invalid argument types ' + assert.stringify(types) + ' supplied to intersection(types, [name]) combinator (expected an array of at least 2 types)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to intersection(types, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(types);

  function Intersection(value, path) {

    if ('development' !== 'production') {
      forbidNewOperator(this, Intersection);
      path = path || [displayName];
      assert(Intersection.is(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/'); });
    }

    return value;
  }

  Intersection.meta = {
    kind: 'intersection',
    types: types,
    name: name,
    identity: true
  };

  Intersection.displayName = displayName;

  Intersection.is = function (x) {
    return types.every(function (type) {
      return is(x, type);
    });
  };

  Intersection.update = function (instance, patch) {
    return Intersection(assert.update(instance, patch));
  };

  return Intersection;
}

intersection.getDefaultName = getDefaultName;
module.exports = intersection;
  })();
});

require.register("tcomb/lib/irreducible.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isString = require('./isString');
var isFunction = require('./isFunction');
var forbidNewOperator = require('./forbidNewOperator');

module.exports = function irreducible(name, predicate) {

  if ('development' !== 'production') {
    assert(isString(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to irreducible(name, predicate) (expected a string)'; });
    assert(isFunction(predicate), 'Invalid argument predicate ' + assert.stringify(predicate) + ' supplied to irreducible(name, predicate) (expected a function)');
  }

  function Irreducible(value, path) {

    if ('development' !== 'production') {
      forbidNewOperator(this, Irreducible);
      path = path || [name];
      assert(predicate(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/'); });
    }

    return value;
  }

  Irreducible.meta = {
    kind: 'irreducible',
    name: name,
    predicate: predicate,
    identity: true
  };

  Irreducible.displayName = name;

  Irreducible.is = predicate;

  return Irreducible;
};
  })();
});

require.register("tcomb/lib/is.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var isType = require('./isType');

// returns true if x is an instance of type
module.exports = function is(x, type) {
  if (isType(type)) {
    return type.is(x);
  }
  return x instanceof type; // type should be a class constructor
};
  })();
});

require.register("tcomb/lib/isArray.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    module.exports = function isArray(x) {
  return x instanceof Array;
};
  })();
});

require.register("tcomb/lib/isBoolean.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    module.exports = function isBoolean(x) {
  return x === true || x === false;
};
  })();
});

require.register("tcomb/lib/isFunction.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    module.exports = function isFunction(x) {
  return typeof x === 'function';
};
  })();
});

require.register("tcomb/lib/isIdentity.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var Boolean = require('./Boolean');
var isType = require('./isType');
var getTypeName = require('./getTypeName');

// return true if the type constructor behaves like the identity function
module.exports = function isIdentity(type) {
  if (isType(type)) {
    if ('development' !== 'production') {
      assert(Boolean.is(type.meta.identity), function () { return 'Invalid meta identity ' + assert.stringify(type.meta.identity) + ' supplied to type ' + getTypeName(type); });
    }
    return type.meta.identity;
  }
  // for tcomb the other constructors, like ES6 classes, are identity-like
  return true;
};
  })();
});

require.register("tcomb/lib/isMaybe.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var isType = require('./isType');

module.exports = function isMaybe(x) {
  return isType(x) && ( x.meta.kind === 'maybe' );
};
  })();
});

require.register("tcomb/lib/isNil.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    module.exports = function isNil(x) {
  return x === null || x === void 0;
};
  })();
});

require.register("tcomb/lib/isNumber.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    module.exports = function isNumber(x) {
  return typeof x === 'number' && isFinite(x) && !isNaN(x);
};
  })();
});

require.register("tcomb/lib/isObject.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var isNil = require('./isNil');
var isArray = require('./isArray');

module.exports = function isObject(x) {
  return !isNil(x) && typeof x === 'object' && !isArray(x);
};
  })();
});

require.register("tcomb/lib/isString.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    module.exports = function isString(x) {
  return typeof x === 'string';
};
  })();
});

require.register("tcomb/lib/isStruct.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var isType = require('./isType');

module.exports = function isStruct(x) {
  return isType(x) && ( x.meta.kind === 'struct' );
};
  })();
});

require.register("tcomb/lib/isType.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var isFunction = require('./isFunction');
var isObject = require('./isObject');

module.exports = function isType(x) {
  return isFunction(x) && isObject(x.meta);
};
  })();
});

require.register("tcomb/lib/isTypeName.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var isNil = require('./isNil');
var isString = require('./isString');

module.exports = function isTypeName(name) {
  return isNil(name) || isString(name);
};
  })();
});

require.register("tcomb/lib/isUnion.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var isType = require('./isType');

module.exports = function isUnion(x) {
  return isType(x) && ( x.meta.kind === 'union' );
};
  })();
});

require.register("tcomb/lib/list.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isTypeName = require('./isTypeName');
var isFunction = require('./isFunction');
var getTypeName = require('./getTypeName');
var isIdentity = require('./isIdentity');
var create = require('./create');
var is = require('./is');
var isArray = require('./isArray');

function getDefaultName(type) {
  return 'Array<' + getTypeName(type) + '>';
}

function list(type, name) {

  if ('development' !== 'production') {
    assert(isFunction(type), function () { return 'Invalid argument type ' + assert.stringify(type) + ' supplied to list(type, [name]) combinator (expected a type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to list(type, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(type);
  var typeNameCache = getTypeName(type);
  var identity = isIdentity(type); // the list is identity iif type is identity

  function List(value, path) {

    if ('development' === 'production') {
      if (identity) {
        return value; // just trust the input if elements must not be hydrated
      }
    }

    if ('development' !== 'production') {
      path = path || [displayName];
      assert(isArray(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/') + ' (expected an array of ' + typeNameCache + ')'; });
    }

    var idempotent = true; // will remain true if I can reutilise the input
    var ret = []; // make a temporary copy, will be discarded if idempotent remains true
    for (var i = 0, len = value.length; i < len; i++ ) {
      var actual = value[i];
      var instance = create(type, actual, ( 'development' !== 'production' ? path.concat(i + ': ' + typeNameCache) : null ));
      idempotent = idempotent && ( actual === instance );
      ret.push(instance);
    }

    if (idempotent) { // implements idempotency
      ret = value;
    }

    if ('development' !== 'production') {
      Object.freeze(ret);
    }

    return ret;
  }

  List.meta = {
    kind: 'list',
    type: type,
    name: name,
    identity: identity
  };

  List.displayName = displayName;

  List.is = function (x) {
    return isArray(x) && x.every(function (e) {
      return is(e, type);
    });
  };

  List.update = function (instance, patch) {
    return List(assert.update(instance, patch));
  };

  return List;
}

list.getDefaultName = getDefaultName;
module.exports = list;
  })();
});

require.register("tcomb/lib/match.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isFunction = require('./isFunction');
var isType = require('./isType');
var Any = require('./Any');

module.exports = function match(x) {
  var type, guard, f, count;
  for (var i = 1, len = arguments.length; i < len; ) {
    type = arguments[i];
    guard = arguments[i + 1];
    f = arguments[i + 2];

    if (isFunction(f) && !isType(f)) {
      i = i + 3;
    }
    else {
      f = guard;
      guard = Any.is;
      i = i + 2;
    }

    if ('development' !== 'production') {
      count = (count || 0) + 1;
      assert(isType(type), function () { return 'Invalid type in clause #' + count; });
      assert(isFunction(guard), function () { return 'Invalid guard in clause #' + count; });
      assert(isFunction(f), function () { return 'Invalid block in clause #' + count; });
    }

    if (type.is(x) && guard(x)) {
      return f(x);
    }
  }
  assert.fail('Match error');
};
  })();
});

require.register("tcomb/lib/maybe.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isTypeName = require('./isTypeName');
var isFunction = require('./isFunction');
var isMaybe = require('./isMaybe');
var isIdentity = require('./isIdentity');
var Any = require('./Any');
var create = require('./create');
var Nil = require('./Nil');
var forbidNewOperator = require('./forbidNewOperator');
var is = require('./is');
var getTypeName = require('./getTypeName');

function getDefaultName(type) {
  return '?' + getTypeName(type);
}

function maybe(type, name) {

  if (isMaybe(type) || type === Any || type === Nil) { // makes the combinator idempotent and handle Any, Nil
    return type;
  }

  if ('development' !== 'production') {
    assert(isFunction(type), function () { return 'Invalid argument type ' + assert.stringify(type) + ' supplied to maybe(type, [name]) combinator (expected a type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to maybe(type, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(type);

  function Maybe(value, path) {
    if ('development' !== 'production') {
      forbidNewOperator(this, Maybe);
    }
    return Nil.is(value) ? null : create(type, value, path);
  }

  Maybe.meta = {
    kind: 'maybe',
    type: type,
    name: name,
    identity: isIdentity(type)
  };

  Maybe.displayName = displayName;

  Maybe.is = function (x) {
    return Nil.is(x) || is(x, type);
  };

  return Maybe;
}

maybe.getDefaultName = getDefaultName;
module.exports = maybe;
  })();
});

require.register("tcomb/lib/mixin.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var isNil = require('./isNil');
var assert = require('./assert');

// safe mixin, cannot override props unless specified
module.exports = function mixin(target, source, overwrite) {
  if (isNil(source)) { return target; }
  for (var k in source) {
    if (source.hasOwnProperty(k)) {
      if (overwrite !== true) {
        if ('development' !== 'production') {
          assert(!target.hasOwnProperty(k), function () { return 'Invalid call to mixin(target, source, [overwrite]): cannot overwrite property "' + k + '" of target object'; });
        }
      }
      target[k] = source[k];
    }
  }
  return target;
};
  })();
});

require.register("tcomb/lib/refinement.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isTypeName = require('./isTypeName');
var isFunction = require('./isFunction');
var forbidNewOperator = require('./forbidNewOperator');
var isIdentity = require('./isIdentity');
var create = require('./create');
var is = require('./is');
var getTypeName = require('./getTypeName');
var getFunctionName = require('./getFunctionName');

function getDefaultName(type, predicate) {
  return '{' + getTypeName(type) + ' | ' + getFunctionName(predicate) + '}';
}

function refinement(type, predicate, name) {

  if ('development' !== 'production') {
    assert(isFunction(type), function () { return 'Invalid argument type ' + assert.stringify(type) + ' supplied to refinement(type, predicate, [name]) combinator (expected a type)'; });
    assert(isFunction(predicate), function () { return 'Invalid argument predicate supplied to refinement(type, predicate, [name]) combinator (expected a function)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to refinement(type, predicate, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(type, predicate);
  var identity = isIdentity(type);

  function Refinement(value, path) {

    if ('development' !== 'production') {
      forbidNewOperator(this, Refinement);
      path = path || [displayName];
    }

    var x = create(type, value, path);

    if ('development' !== 'production') {
      assert(predicate(x), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/'); });
    }

    return x;
  }

  Refinement.meta = {
    kind: 'subtype',
    type: type,
    predicate: predicate,
    name: name,
    identity: identity
  };

  Refinement.displayName = displayName;

  Refinement.is = function (x) {
    return is(x, type) && predicate(x);
  };

  Refinement.update = function (instance, patch) {
    return Refinement(assert.update(instance, patch));
  };

  return Refinement;
}

refinement.getDefaultName = getDefaultName;
module.exports = refinement;
  })();
});

require.register("tcomb/lib/stringify.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    module.exports = function stringify(x) {
  try { // handle "Converting circular structure to JSON" error
    return JSON.stringify(x, null, 2);
  }
  catch (e) {
    return String(x);
  }
};
  })();
});

require.register("tcomb/lib/struct.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isTypeName = require('./isTypeName');
var String = require('./String');
var Function = require('./Function');
var isArray = require('./isArray');
var isObject = require('./isObject');
var create = require('./create');
var mixin = require('./mixin');
var isStruct = require('./isStruct');
var getTypeName = require('./getTypeName');
var dict = require('./dict');

function getDefaultName(props) {
  return '{' + Object.keys(props).map(function (prop) {
    return prop + ': ' + getTypeName(props[prop]);
  }).join(', ') + '}';
}

function extend(mixins, name) {
  if ('development' !== 'production') {
    assert(isArray(mixins) && mixins.every(function (x) {
      return isObject(x) || isStruct(x);
    }), function () { return 'Invalid argument mixins supplied to extend(mixins, name), expected an array of objects or structs'; });
  }
  var props = {};
  var prototype = {};
  mixins.forEach(function (struct) {
    if (isObject(struct)) {
      mixin(props, struct);
    }
    else {
      mixin(props, struct.meta.props);
      mixin(prototype, struct.prototype);
    }
  });
  var ret = struct(props, name);
  mixin(ret.prototype, prototype);
  return ret;
}

function struct(props, name) {

  if ('development' !== 'production') {
    assert(dict(String, Function).is(props), function () { return 'Invalid argument props ' + assert.stringify(props) + ' supplied to struct(props, [name]) combinator (expected a dictionary String -> Type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to struct(props, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(props);

  function Struct(value, path) {

    if (Struct.is(value)) { // implements idempotency
      return value;
    }

    if ('development' !== 'production') {
      path = path || [displayName];
      assert(isObject(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/') + ' (expected an object)'; });
    }

    if (!(this instanceof Struct)) { // `new` is optional
      return new Struct(value, path);
    }

    for (var k in props) {
      if (props.hasOwnProperty(k)) {
        var expected = props[k];
        var actual = value[k];
        this[k] = create(expected, actual, ( 'development' !== 'production' ? path.concat(k + ': ' + getTypeName(expected)) : null ));
      }
    }

    if ('development' !== 'production') {
      Object.freeze(this);
    }

  }

  Struct.meta = {
    kind: 'struct',
    props: props,
    name: name,
    identity: false
  };

  Struct.displayName = displayName;

  Struct.is = function (x) {
    return x instanceof Struct;
  };

  Struct.update = function (instance, patch) {
    return new Struct(assert.update(instance, patch));
  };

  Struct.extend = function (structs, name) {
    return extend([Struct].concat(structs), name);
  };

  return Struct;
}

struct.getDefaultName = getDefaultName;
struct.extend = extend;
module.exports = struct;
  })();
});

require.register("tcomb/lib/tuple.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isTypeName = require('./isTypeName');
var isFunction = require('./isFunction');
var getTypeName = require('./getTypeName');
var isIdentity = require('./isIdentity');
var isArray = require('./isArray');
var create = require('./create');
var is = require('./is');

function getDefaultName(types) {
  return '[' + types.map(getTypeName).join(', ') + ']';
}

function tuple(types, name) {

  if ('development' !== 'production') {
    assert(isArray(types) && types.every(isFunction), function () { return 'Invalid argument types ' + assert.stringify(types) + ' supplied to tuple(types, [name]) combinator (expected an array of types)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to tuple(types, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(types);
  var identity = types.every(isIdentity);

  function Tuple(value, path) {

    if ('development' === 'production') {
      if (identity) {
        return value;
      }
    }

    if ('development' !== 'production') {
      path = path || [displayName];
      assert(isArray(value) && value.length === types.length, function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/') + ' (expected an array of length ' + types.length + ')'; });
    }

    var idempotent = true;
    var ret = [];
    for (var i = 0, len = types.length; i < len; i++) {
      var expected = types[i];
      var actual = value[i];
      var instance = create(expected, actual, ( 'development' !== 'production' ? path.concat(i + ': ' + getTypeName(expected)) : null ));
      idempotent = idempotent && ( actual === instance );
      ret.push(instance);
    }

    if (idempotent) { // implements idempotency
      ret = value;
    }

    if ('development' !== 'production') {
      Object.freeze(ret);
    }

    return ret;
  }

  Tuple.meta = {
    kind: 'tuple',
    types: types,
    name: name,
    identity: identity
  };

  Tuple.displayName = displayName;

  Tuple.is = function (x) {
    return isArray(x) &&
      x.length === types.length &&
      types.every(function (type, i) {
        return is(x[i], type);
      });
  };

  Tuple.update = function (instance, patch) {
    return Tuple(assert.update(instance, patch));
  };

  return Tuple;
}

tuple.getDefaultName = getDefaultName;
module.exports = tuple;
  })();
});

require.register("tcomb/lib/union.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isTypeName = require('./isTypeName');
var isFunction = require('./isFunction');
var getTypeName = require('./getTypeName');
var isIdentity = require('./isIdentity');
var isArray = require('./isArray');
var create = require('./create');
var is = require('./is');
var forbidNewOperator = require('./forbidNewOperator');
var isType = require('./isType');
var isUnion = require('./isUnion');
var isNil = require('./isNil');

function getDefaultName(types) {
  return types.map(getTypeName).join(' | ');
}

function union(types, name) {

  if ('development' !== 'production') {
    assert(isArray(types) && types.every(isFunction) && types.length >= 2, function () { return 'Invalid argument types ' + assert.stringify(types) + ' supplied to union(types, [name]) combinator (expected an array of at least 2 types)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to union(types, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(types);
  var identity = types.every(isIdentity);

  function Union(value, path) {

    if ('development' === 'production') {
      if (identity) {
        return value;
      }
    }

    var type = Union.dispatch(value);
    if (!type && Union.is(value)) {
      return value;
    }

    if ('development' !== 'production') {
      forbidNewOperator(this, Union);
      path = path || [displayName];
      assert(isType(type), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/') + ' (no constructor returned by dispatch)'; });
      path[path.length - 1] += '(' + getTypeName(type) + ')';
    }

    return create(type, value, path);
  }

  Union.meta = {
    kind: 'union',
    types: types,
    name: name,
    identity: identity
  };

  Union.displayName = displayName;

  Union.is = function (x) {
    return types.some(function (type) {
      return is(x, type);
    });
  };

  Union.dispatch = function (x) { // default dispatch implementation
    for (var i = 0, len = types.length; i < len; i++ ) {
      var type = types[i];
      if (isUnion(type)) { // handle union of unions
        var t = type.dispatch(x);
        if (!isNil(t)) {
          return t;
        }
      }
      else if (is(x, type)) {
        return type;
      }
    }
  };

  Union.update = function (instance, patch) {
    return Union(assert.update(instance, patch));
  };

  return Union;
}

union.getDefaultName = getDefaultName;
module.exports = union;
  })();
});

require.register("tcomb/lib/update.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "tcomb");
  (function() {
    var assert = require('./assert');
var isObject = require('./isObject');
var isFunction = require('./isFunction');
var isArray = require('./isArray');
var isNumber = require('./isNumber');
var mixin = require('./mixin');

function getShallowCopy(x) {
  if (isArray(x)) {
    return x.concat();
  }
  if (x instanceof Date || x instanceof RegExp) {
    return x;
  }
  if (isObject(x)) {
    return mixin({}, x);
  }
  return x;
}

function update(instance, patch) {

  if ('development' !== 'production') {
    assert(isObject(patch), function () { return 'Invalid argument patch ' + assert.stringify(patch) + ' supplied to function update(instance, patch): expected an object containing commands'; });
  }

  var value = getShallowCopy(instance);
  var isChanged = false;
  for (var k in patch) {
    if (patch.hasOwnProperty(k)) {
      if (update.commands.hasOwnProperty(k)) {
        value = update.commands[k](patch[k], value);
        isChanged = true;
      }
      else {
        var newValue = update(value[k], patch[k]);
        isChanged = isChanged || ( newValue !== value[k] );
        value[k] = newValue;
      }
    }
  }
  return isChanged ? value : instance;
}

// built-in commands

function $apply(f, value) {
  if ('development' !== 'production') {
    assert(isFunction(f), 'Invalid argument f supplied to immutability helper { $apply: f } (expected a function)');
  }
  return f(value);
}

function $push(elements, arr) {
  if ('development' !== 'production') {
    assert(isArray(elements), 'Invalid argument elements supplied to immutability helper { $push: elements } (expected an array)');
    assert(isArray(arr), 'Invalid value supplied to immutability helper $push (expected an array)');
  }
  return arr.concat(elements);
}

function $remove(keys, obj) {
  if ('development' !== 'production') {
    assert(isArray(keys), 'Invalid argument keys supplied to immutability helper { $remove: keys } (expected an array)');
    assert(isObject(obj), 'Invalid value supplied to immutability helper $remove (expected an object)');
  }
  for (var i = 0, len = keys.length; i < len; i++ ) {
    delete obj[keys[i]];
  }
  return obj;
}

function $set(value) {
  return value;
}

function $splice(splices, arr) {
  if ('development' !== 'production') {
    assert(isArray(splices) && splices.every(isArray), 'Invalid argument splices supplied to immutability helper { $splice: splices } (expected an array of arrays)');
    assert(isArray(arr), 'Invalid value supplied to immutability helper $splice (expected an array)');
  }
  return splices.reduce(function (acc, splice) {
    acc.splice.apply(acc, splice);
    return acc;
  }, arr);
}

function $swap(config, arr) {
  if ('development' !== 'production') {
    assert(isObject(config), 'Invalid argument config supplied to immutability helper { $swap: config } (expected an object)');
    assert(isNumber(config.from), 'Invalid argument config.from supplied to immutability helper { $swap: config } (expected a number)');
    assert(isNumber(config.to), 'Invalid argument config.to supplied to immutability helper { $swap: config } (expected a number)');
    assert(isArray(arr), 'Invalid value supplied to immutability helper $swap (expected an array)');
  }
  var element = arr[config.to];
  arr[config.to] = arr[config.from];
  arr[config.from] = element;
  return arr;
}

function $unshift(elements, arr) {
  if ('development' !== 'production') {
    assert(isArray(elements), 'Invalid argument elements supplied to immutability helper {$unshift: elements} (expected an array)');
    assert(isArray(arr), 'Invalid value supplied to immutability helper $unshift (expected an array)');
  }
  return elements.concat(arr);
}

function $merge(obj, value) {
  return mixin(mixin({}, value), obj, true);
}

update.commands = {
  $apply: $apply,
  $push: $push,
  $remove: $remove,
  $set: $set,
  $splice: $splice,
  $swap: $swap,
  $unshift: $unshift,
  $merge: $merge
};

module.exports = update;
  })();
});

require.register("units-css/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "units-css");
  (function() {
    /* eslint-env browser, node */

'use strict';

module.exports = require('./lib');
  })();
});

require.register("units-css/lib/conversions/angle.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "units-css");
  (function() {
    /* eslint-env browser, node */

'use strict';

var angle = {'_default': 'deg'};

// Supported units:
// deg, grad, rad, turn

angle.deg = {
  'grad': function(value) {
    return value / 0.9;
  },

  'rad': function(value) {
    return value * (Math.PI / 180);
  },

  'turn': function(value) {
    return value / 360;
  }
};

angle.grad = {
  'deg': function(value) {
    return value * 0.9;
  }
};

angle.rad = {
  'deg': function(value) {
    return value / (Math.PI / 180);
  }
};

angle.turn = {
  'deg': function(value) {
    return value * 360;
  }
};

// Exports
module.exports = angle;
  })();
});

require.register("units-css/lib/conversions/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "units-css");
  (function() {
    /* eslint-env browser, node */

'use strict';

// Exports
module.exports = {
  'angle': require('./angle'),
  'length': require('./length'),
  'resolution': require('./resolution')
};
  })();
});

require.register("units-css/lib/conversions/length.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "units-css");
  (function() {
    /* eslint-env browser, node */

'use strict';

// Imports
var utilities = require('./../utilities');
var viewport = require('viewport-dimensions');

var length = {'_default': 'px'};

// Supported units:
// %, ch, cm, em, ex, in, mm, pc, pt, px, rem, vh, vmax, vmin, vw

length[''] = {
  'px': function(value, element) {
    return parseFloat(getComputedStyle(element, '').fontSize) * value;
  }
};

length['%'] = {
  'px': function(value, element, property) {
    return (value * utilities.getRelativeElementDimension(element, property)) / 100;
  }
};

length.ch = {
  'px': function(value, element) {
    return value * utilities.ifZeroThenOne(utilities.getCreatedElementWidth(element, null, '0'));
  }
};

length.cm = {
  'px': function(value) {
    return value / 2.54 * utilities.ifZeroThenOne(utilities.DPI);
  }
};

length.em = {
  'px': function(value, element) {
    return value * utilities.getElementFontSize(element);
  }
};

length.ex = {
  'px': function(value, element) {
    return value * utilities.getCreatedElementHeight(element, null, 'x');
  }
};

length['in'] = {
  'px': function(value) {
    return value * utilities.DPI;
  }
};

length.mm = {
  'px': function(value) {
    return value / 2.54 * utilities.ifZeroThenOne(utilities.DPI) / 10;
  }
};

length.pc = {
  'px': function(value) {
    return value * ((utilities.DPI / 72) * 12);
  }
};

length.pt = {
  'px': function(value) {
    return value * utilities.DPI / 72;
  }
};

length.px = {
  '': function(value, element) {
    return value / parseFloat(getComputedStyle(element, '').fontSize);
  },

  '%': function(value, element, property) {
    return (value / utilities.ifZeroThenOne(utilities.getRelativeElementDimension(element, property))) * 100;
  },

  'ch': function(value, element) {
    return value / utilities.ifZeroThenOne(utilities.getCreatedElementWidth(element, null, '0'));
  },

  'cm': function(value) {
    return value / utilities.ifZeroThenOne(utilities.DPI) * 2.54;
  },

  'em': function(value, element) {
    return value / utilities.ifZeroThenOne(utilities.getElementFontSize(element));
  },

  'ex': function(value, element) {
    return value / utilities.ifZeroThenOne(utilities.getCreatedElementHeight(element, null, 'x'));
  },

  'in': function(value) {
    return value / utilities.ifZeroThenOne(utilities.DPI);
  },

  'mm': function(value) {
    return value * 2.54 / utilities.ifZeroThenOne(utilities.DPI) * 10;
  },

  'pc': function(value) {
    return value / ((utilities.DPI / 72) * 12);
  },

  'pt': function(value) {
    return value * 72 / utilities.DPI;
  },

  'rem': function(value) {
    return value / utilities.ifZeroThenOne(utilities.getElementFontSize(document.documentElement));
  },

  'vh': function(value) {
    return value / utilities.ifZeroThenOne((viewport.height() / 100));
  },

  'vmax': function(value) {
    return value / utilities.ifZeroThenOne((viewport.max() / 100));
  },

  'vmin': function(value) {
    return value / utilities.ifZeroThenOne((viewport.min() / 100));
  },

  'vw': function(value) {
    return value / utilities.ifZeroThenOne((viewport.width() / 100));
  }
};

length.rem = {
  'px': function(value) {
    return value * utilities.getElementFontSize(document.documentElement);
  }
};

length.vh = {
  'px': function(value) {
    return value * (viewport.height() / 100);
  }
};

length.vmax = {
  'px': function(value) {
    return value * (viewport.max() / 100);
  }
};

length.vmin = {
  'px': function(value) {
    return value * (viewport.min() / 100);
  }
};

length.vw = {
  'px': function(value) {
    return value * (viewport.width() / 100);
  }
};

// Exports
module.exports = length;
  })();
});

require.register("units-css/lib/conversions/resolution.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "units-css");
  (function() {
    /* eslint-env browser, node */

'use strict';

// Imports
var utilities = require('./../utilities');

var resolution = {'_default': 'dpi'};

// Supported units:
// dpi, dpcm, dppx

resolution.dpi = {
  'dpcm': function(value) {
    return value / 2.54;
  },

  'dppx': function(value) {
    return value / utilities.DPI;
  }
};

resolution.dpcm = {
  'dpi': function(value) {
    return value * 2.54;
  }
};

resolution.dppx = {
  'dpi': function(value) {
    return value * utilities.DPI;
  }
};

// Exports
module.exports = resolution;
  })();
});

require.register("units-css/lib/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "units-css");
  (function() {
    /* eslint-env browser, node */

'use strict';

// Imports
var conversions = require('./conversions');
var isNumeric = require('isnumeric/isNumeric');

var units = {};


// Expose conversion functions
//------------------------------------------------------------------------------

units.conversions = conversions;


// Properties with non default unit/value
//------------------------------------------------------------------------------

var properties = units.properties = {};

properties.lineHeight =
properties.opacity =
properties.scale =
properties.scale3d =
properties.scaleX =
properties.scaleY =
properties.scaleZ = {
  'defaultUnit': '',
  'defaultValue': 1
};

properties.rotate =
properties.rotate3d =
properties.rotateX =
properties.rotateY =
properties.rotateZ =
properties.skew =
properties.skewX =
properties.skewY = {
  'defaultUnit': 'deg'
};

properties.resolution = {
  'defaultUnit': 'dpi',
  'defaultValue': 96
};


// Public interface
//------------------------------------------------------------------------------

units.convert = function(to, value, element, property) {
  var parts = units.parse(value, property);

  if (to === '_default') {
    to = units.getDefaultUnit(property);
  }

  return to === parts.unit
    ? parts.value
    : units.processConversion(parts.unit, to, parts.value, element, property);
};

units.parse = function(value, property) {
  var parts = {};
  var matches;

  if (isNumeric(value)) {
    parts.value = value;
    parts.unit = property
      ? units.getDefaultUnit(property)
      : '';
  } else {
    matches = value.toString().trim().match(/^(-?[\d+\.\-]+)([a-z]+|%)$/i);

    if (matches !== null) {
      parts.value = matches[1];
      parts.unit = matches[2];
    } else {
      parts.unit = value;
      parts.value = property
        ? units.getDefaultValue(property)
        : 0;
    }
  }

  parts.value = parseFloat(parts.value);

  return parts;
};

units.getDefaultValue = function(property) {
  return typeof properties[property] !== 'undefined' && typeof properties[property].defaultValue !== 'undefined'
    ? properties[property].defaultValue
    : 0;
};

units.getDefaultUnit = function(property) {
  return typeof properties[property] !== 'undefined' && typeof properties[property].defaultUnit !== 'undefined'
    ? properties[property].defaultUnit
    : 'px';
};


// Protected methods
//------------------------------------------------------------------------------

units.processConversion = function(fromUnits, toUnits, value, element, property) {
  var type = units.getConversionType(fromUnits);
  var method;

  if (typeof type[fromUnits][toUnits] === 'function') {
    method = type[fromUnits][toUnits];
  } else {
    method = type[type._default][toUnits];
    value = type[fromUnits][type._default](value, element, property); // Use default unit conversion as an interstitial step
  }

  return method(value, element, property);
};

units.getConversionType = function(fromUnits) {
  var property;
  var type = null;

  for (property in conversions) {
    /* istanbul ignore else */
    if (conversions.hasOwnProperty(property) && typeof conversions[property][fromUnits] !== 'undefined') {
      type = conversions[property];
      break;
    }
  }

  return type;
};

// Exports
module.exports = units;
  })();
});

require.register("units-css/lib/utilities.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "units-css");
  (function() {
    /* eslint-env browser, node */

'use strict';

var utilities = {};

utilities.getElementFontSize = function(element) {
  return typeof getComputedStyle !== 'undefined'
    ? parseFloat(getComputedStyle(element, '').fontSize)
    : 16; // Default browser font-size
};

utilities.getCreatedElementDimensions = function(parent, properties, content) {
  var element = document.createElement('div');
  var style = element.style;
  var dimensions;
  var property;

  style.position = 'absolute';
  style.zIndex = -2147483648;
  style.left = 0;
  style.top = 0;
  style.visibility = 'hidden';

  if (properties) {
    for (property in properties) {
      /* istanbul ignore else */
      if (properties.hasOwnProperty(property)) {
        style[property] = properties[property];
      }
    }
  }

  if (content) {
    element.innerHTML = content;
  }

  parent.appendChild(element);

  dimensions = [
    element.offsetWidth,
    element.offsetHeight
  ];

  parent.removeChild(element);

  return dimensions;
};

utilities.getCreatedElementWidth = function(parent, properties, content) {
  return utilities.getCreatedElementDimensions(parent, properties, content)[0];
};

utilities.getCreatedElementHeight = function(parent, properties, content) {
  return utilities.getCreatedElementDimensions(parent, properties, content)[1];
};

var selfReferenceTriggers = [
  'perspective',
  'translate',
  'translate3d',
  'translateX',
  'translateY',
  'translateZ',
  'transformOrigin'
];

var layoutYTriggers = [
  'height',
  'top',
  'translateY'
];

var positionTriggers = ['absolute', 'fixed'];

utilities.getRelativeElementDimension = function(element, property) {
  var reference;
  var dimension;
  var referenceComputed;
  var useY = layoutYTriggers.indexOf(property) > -1;
  var useSelf = selfReferenceTriggers.indexOf(property) > -1;
  var positioned = positionTriggers.indexOf(getComputedStyle(element, '').position) > -1;

  if (useSelf) {
    reference = element;
  } else {
    reference = positioned
      ? element.offsetParent
      : element.parentNode;
  }

  dimension = useY
    ? reference.offsetHeight
    : reference.offsetWidth;

  if (!useSelf && positioned) {
    referenceComputed = getComputedStyle(reference, '');

    dimension -= useY
      ? parseFloat(referenceComputed.paddingTop) + parseFloat(referenceComputed.paddingBottom)
      : parseFloat(referenceComputed.paddingRight) + parseFloat(referenceComputed.paddingLeft);
  }

  return dimension;
};

utilities.DPI = (function () {
  // Preserve dpi-reliant conversion functionality when not running in browser environment
  /* istanbul ignore next */
  if (typeof window === 'undefined') {
    return 96;
  }

  return utilities.getCreatedElementWidth(document.body, {
    'width': '1in'
  });
}());

/**
 * Return value if non-zero, else return one (to avoid division by zero in calling code).
 *
 * @param {number} value Number to return, converting to one if zero.
 * @returns {number} Non-zero value.
 */
utilities.ifZeroThenOne = function(value) {
  return value === 0
    ? 1
    : value;
};

// Exports
module.exports = utilities;
  })();
});

require.register("unquote/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "unquote");
  (function() {
    var reg = /[\'\"]/

module.exports = function unquote(str) {
  if (!str) {
    return ''
  }
  if (reg.test(str.charAt(0))) {
    str = str.substr(1)
  }
  if (reg.test(str.charAt(str.length - 1))) {
    str = str.substr(0, str.length - 1)
  }
  return str
}
  })();
});

require.register("util-deprecate/browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "util-deprecate");
  (function() {
    /**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}
  })();
});

require.register("viewport-dimensions/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "viewport-dimensions");
  (function() {
    /* eslint-env browser, node */

'use strict';

var viewport = {};
var width = -1;
var height = -1;


// Public interface
//------------------------------------------------------------------------------

/**
 * Get browser viewport width.
 *
 * @returns {number} Internal reference to browser viewport width.
 */
viewport.width = function() {
  return width;
};

/**
 * Get browser viewport height.
 *
 * @returns {number} Internal reference to browser viewport height.
 */
viewport.height = function() {
  return height;
};

/**
 * Get maximum browser viewport dimension (width or height).
 *
 * @returns {number} Internal reference to maximum browser viewport dimension.
 */
viewport.max = function() {
  return Math.max(width, height);
};

/**
 * Get minimum browser viewport dimension (width or height).
 *
 * @returns {number} Internal reference to minimum browser viewport dimension.
 */
viewport.min = function() {
  return Math.min(width, height);
};


/**
 * Set internal dimension references to current browser viewport width and height.
 * Called by viewport#onWindowResize on resize and orientationchange.
 */
viewport.setDimensions = function() {
  /* istanbul ignore else */
  if (typeof document !== 'undefined') {
    width = document.documentElement.clientWidth;
    height = document.documentElement.clientHeight;
  }
};


// Protected methods
//------------------------------------------------------------------------------

/**
 * Handler for window resize and orientationchange events. Calls viewport#setDimensions.
 *
 * @private
 */
viewport.onWindowResize = function() {
  viewport.setDimensions();
};

/* istanbul ignore else */
if (typeof window !== 'undefined') {
  window.addEventListener('resize', viewport.onWindowResize, false);
  window.addEventListener('orientationchange', viewport.onWindowResize, false);

  viewport.setDimensions();
}

// Exports
module.exports = viewport;
  })();
});
require.register("js/resemblixir.js", function(exports, require, module) {
"use strict";

require("phoenix_html");

var _socket = require("./socket");

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

});

;require.register("js/socket.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _phoenix = require("phoenix");

var _resemblejs = require("resemblejs");

var _resemblejs2 = _interopRequireDefault(_resemblejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var socket = void 0;
if (window.run_tests) {
  var onResembleComplete = function onResembleComplete(params) {
    return function (data) {
      if (data.error) {
        console.error(data);
      } else {
        console.log("params", params);
        console.log("data", data);
        var diff_image = document.getElementById(params.file_name + "-diff");
        diff_image.src = data.getImageDataUrl();
      }
    };
  };

  var _socket = new _phoenix.Socket("/resemblixir_socket", {});

  _socket.connect();

  var channel = _socket.channel("resemblixir:test", {});
  channel.join().receive("ok", function (resp) {
    console.log("Joined successfully", resp);
  }).receive("error", function (resp) {
    console.log("Unable to join", resp);
  });

  channel.on("error", function (error) {
    _socket.disconnect();
    console.error("error", error);
  });
  channel.on("breakpoint_started", function (data) {
    console.log("breakpoint started", data);
  });
  channel.on("test_image_ready", function (data) {
    console.log("test image ready", data);
    try {
      var test_image = document.getElementById(data.file_name + "-test");
      test_image.src = "/images/test/" + data.file_name + ".png";
      var ref_image = document.getElementById(data.file_name + "-ref");
      var fileReader = new FileReader();
      console.log("fileReader", fileReader);
      (0, _resemblejs2.default)("/images/reference/" + data.file_name + ".png").compareTo("/images/test/" + data.file_name + ".png").onComplete(onResembleComplete(data));
    } catch (error) {
      _socket.disconnect();
      console.error(error);
    }
  });
}
exports.default = socket;

});

require.alias("buffer/index.js", "buffer");
require.alias("canvas/lib/canvas.js", "canvas");
require.alias("core-util-is/lib/util.js", "core-util-is");
require.alias("css-font-size-keywords/index.json", "css-font-size-keywords");
require.alias("css-font-stretch-keywords/index.json", "css-font-stretch-keywords");
require.alias("css-font-style-keywords/index.json", "css-font-style-keywords");
require.alias("css-font-weight-keywords/index.json", "css-font-weight-keywords");
require.alias("css-global-keywords/index.json", "css-global-keywords");
require.alias("css-system-font-keywords/index.json", "css-system-font-keywords");
require.alias("events/events.js", "events");
require.alias("inherits/inherits_browser.js", "inherits");
require.alias("phoenix/priv/static/phoenix.js", "phoenix");
require.alias("phoenix_html/priv/static/phoenix_html.js", "phoenix_html");
require.alias("process/browser.js", "process");
require.alias("readable-stream/readable-browser.js", "readable-stream");
require.alias("readable-stream/duplex-browser.js", "readable-stream/duplex");
require.alias("readable-stream/duplex-browser.js", "readable-stream/duplex.js");
require.alias("readable-stream/lib/internal/streams/stream-browser.js", "readable-stream/lib/internal/streams/stream");
require.alias("readable-stream/lib/internal/streams/stream-browser.js", "readable-stream/lib/internal/streams/stream.js");
require.alias("readable-stream/readable-browser.js", "readable-stream/readable");
require.alias("readable-stream/readable-browser.js", "readable-stream/readable.js");
require.alias("readable-stream/writable-browser.js", "readable-stream/writable");
require.alias("readable-stream/writable-browser.js", "readable-stream/writable.js");
require.alias("resemblejs/resemble.js", "resemblejs");
require.alias("stream-browserify/index.js", "stream");
require.alias("string_decoder/lib/string_decoder.js", "string_decoder");
require.alias("util-deprecate/browser.js", "util-deprecate");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

require('js/resemblixir');
//# sourceMappingURL=resemblixir.js.map