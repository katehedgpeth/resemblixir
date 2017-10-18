/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(7);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("stream");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*!
 * Canvas
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var canvas = __webpack_require__(0)
  , Canvas = canvas.Canvas
  , Image = canvas.Image
  , cairoVersion = canvas.cairoVersion
  , Context2d = __webpack_require__(3)
  , PNGStream = __webpack_require__(10)
  , PDFStream = __webpack_require__(11)
  , JPEGStream = __webpack_require__(12)
  , FontFace = canvas.FontFace
  , fs = __webpack_require__(4)
  , packageJson = __webpack_require__(13)
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

__webpack_require__(3);

/**
 * Image implementation.
 */

__webpack_require__(14);

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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*!
 * Canvas - Context2d
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var canvas = __webpack_require__(0)
  , Context2d = canvas.CanvasRenderingContext2d
  , CanvasGradient = canvas.CanvasGradient
  , CanvasPattern = canvas.CanvasPattern
  , ImageData = canvas.ImageData;

var parseCssFont = __webpack_require__(8);

var unitsCss = __webpack_require__(9);

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


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const resemble = __webpack_require__(6);
const fs = __webpack_require__(4);
const path = __webpack_require__(15);

//process.stdout.write(JSON.stringify(process.argv))

const referencePath = process.argv[2];
const testPath = process.argv[3];

const referenceFile = fs.readFileSync(referencePath);
const testFile = fs.readFileSync(testPath);


resemble(referenceFile).compareTo(testFile).onComplete(function(data) {
  var buffer = data.getBuffer()
  const result = {data: data, diff: null}
  if ((data.rawMisMatchPercentage > 0) ||
      (data.dimensionDifference.height != 0) ||
      (data.dimensionDifference.width != 0)) {
    const testName = path.basename(testPath);
    const testFolder = path.dirname(testPath);
    const diffName = "failed_diff_" + testName;
    const diffPath = path.join(testFolder, diffName);
    fs.writeFileSync(diffPath, data.getBuffer());
    result.diff = diffPath;
  }
  process.stdout.write(JSON.stringify(result))
});


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
James Cryer / Huddle
URL: https://github.com/Huddle/Resemble.js
*/

(function (root, factory) {
	if (true) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
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
			var Canvas = __webpack_require__(2);
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
				var CanvasImage = __webpack_require__(2).Image;
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


/***/ }),
/* 7 */
/***/ (function(module, exports) {

throw new Error("Module parse failed: /Users/katehedgpeth/Documents/resemblixir/node_modules/canvas/build/Release/canvas.node Unexpected character '�' (1:0)\nYou may need an appropriate loader to handle this file type.\n(Source code omitted for this binary file)");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("parse-css-font");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("units-css");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*!
 * Canvas - PNGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Stream = __webpack_require__(1).Stream;

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


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*!
 * Canvas - PDFStream
 */

/**
 * Module dependencies.
 */

var Stream = __webpack_require__(1).Stream;

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


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*!
 * Canvas - JPEGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Stream = __webpack_require__(1).Stream;

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


/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = {"_args":[[{"name":"canvas","raw":"canvas","rawSpec":"","scope":null,"spec":"latest","type":"tag"},"/Users/katehedgpeth/Documents/resemblixir"]],"_from":"canvas@latest","_id":"canvas@1.6.7","_inCache":true,"_installable":true,"_location":"/canvas","_nodeVersion":"8.4.0","_npmOperationalInternal":{"host":"s3://npm-registry-packages","tmp":"tmp/canvas-1.6.7.tgz_1504863402684_0.15115133952349424"},"_npmUser":{"email":"linus@folkdatorn.se","name":"linusu"},"_npmVersion":"5.3.0","_phantomChildren":{},"_requested":{"name":"canvas","raw":"canvas","rawSpec":"","scope":null,"spec":"latest","type":"tag"},"_requiredBy":["/"],"_resolved":"https://registry.npmjs.org/canvas/-/canvas-1.6.7.tgz","_shasum":"2d8a04b453ec5d6510727cfc697e236dc4ae85dc","_shrinkwrap":null,"_spec":"canvas","_where":"/Users/katehedgpeth/Documents/resemblixir","author":{"email":"tj@learnboost.com","name":"TJ Holowaychuk"},"bugs":{"url":"https://github.com/Automattic/node-canvas/issues"},"contributors":[{"email":"nathan@tootallnate.net","name":"Nathan Rajlich"},{"email":"r@va.gg","name":"Rod Vagg"},{"email":"kangax@gmail.com","name":"Juriy Zaytsev"}],"dependencies":{"nan":"^2.4.0","parse-css-font":"^2.0.2","units-css":"^0.4.0"},"description":"Canvas graphics API backed by Cairo","devDependencies":{"body-parser":"^1.13.3","express":"^4.13.2","mocha":"*","pug":"^2.0.0-beta3","standard":"^10.0.3"},"directories":{},"dist":{"integrity":"sha512-QLFCd9ca/Ww3s4vUf1KxmTX2QoYu8sZkSvXQ36RdbqNETDjn/I1H01ZEtWGGLcY0T7zNO6nsGoHX+0zrMy6JrQ==","shasum":"2d8a04b453ec5d6510727cfc697e236dc4ae85dc","tarball":"https://registry.npmjs.org/canvas/-/canvas-1.6.7.tgz"},"engines":{"node":">=0.8.0"},"gitHead":"db4e48c3936095e3bf191ab7b70d91eaa86db37c","gypfile":true,"homepage":"https://github.com/Automattic/node-canvas","keywords":["canvas","graphic","graphics","pixman","cairo","image","images","pdf"],"license":"MIT","main":"./lib/canvas.js","maintainers":[{"email":"linus@folkdatorn.se","name":"linusu"},{"email":"d@domenic.me","name":"domenic"},{"email":"kangax@gmail.com","name":"kangax"},{"email":"nathan@tootallnate.net","name":"tootallnate"},{"email":"rauchg@gmail.com","name":"rauchg"},{"email":"tj@vision-media.ca","name":"tjholowaychuk"}],"name":"canvas","optionalDependencies":{},"readme":"ERROR: No README data found!","repository":{"type":"git","url":"git://github.com/Automattic/node-canvas.git"},"scripts":{"benchmark":"node benchmarks/run.js","install":"node-gyp rebuild","prebenchmark":"node-gyp build","pretest":"node-gyp build","pretest-server":"node-gyp build","test":"standard examples/*.js && mocha test/*.test.js","test-server":"node test/server.js"},"version":"1.6.7"}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*!
 * Canvas - Image
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Canvas = __webpack_require__(0)
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


/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ })
/******/ ]);
//# sourceMappingURL=compare.bundle.js.map