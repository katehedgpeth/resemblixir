var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var nodeExternals = require('webpack-node-externals');

var nodeModules = {};
fs.readdirSync('./node_modules')
.filter(function(x) {
  return ['.bin'].indexOf(x) === -1;
})
.forEach(function(mod) {
  nodeModules[mod] = 'commonjs ' + mod;
});

module.exports = {
  entry: './priv/js/compare.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'priv', 'js'),
    filename: 'compare.bundle.js'
  },
  externals: [nodeExternals()],
  devtool: 'sourcemap'
}
