console.log("hello there!");

fs = require("fs");
resembleJs = require("./resemble");
png = require("node-png").PNG;

console.log(process.cwd())
fs.createReadStream('sample.png')
  .pipe(new png({
    filterType: 4
  }))
  .on('parsed', function() {
    console.log("image", this.data);
    console.log("width", this.width);
    console.log("height", this.height);
    console.log("this", this)
    console.log(this.data[0])
    var result = parseImage(this.data, this.width, this.height);
    console.log("result", result)
    // this.pack().pipe({
    //   on: function(event) {
    //     console.log("event", event);
    //     resembleJs(data).onComplete(function(err, result) {
    //       console.log(result);
    //     })
    //   }
    // });
  });


function loop(w, h, callback){
  var x,y;

  for (x=0;x<w;x++){
    for (y=0;y<h;y++){
      callback(x, y);
    }
  }
}



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

  return data
  // triggerDataUpdate();
}

function getBrightness(r,g,b){
  return 0.3*r + 0.59*g + 0.11*b;
}
