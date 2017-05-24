var fs = require('fs');
var Path = require('path');

var screenshot = require('electron-screenshot-service');
var name = process.env.TEST_NAME
var test_path = process.env.TEST_PATH || ""
var width = process.env.TEST_WIDTH || 1024
var height = process.env.TEST_HEIGHT || 768
var url = process.env.URL
var breakpoint = process.env.BREAKPOINT
var folder = process.env.TEST_FOLDER
var fileName = Path.join(folder, name +'-'+ breakpoint +'.png')

console.log(width)

screenshot({
  url : Path.join(url, test_path),
  width : width,
  height : height
})
.then(function(img){
  fs.writeFile(fileName, img.data, function(err){
    screenshot.close();
  });
});
