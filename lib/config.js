
var fs = require('fs');

var config = null;
exports.load = function() {
  if(!config) {
    config = JSON.parse(fs.readFileSync(__dirname+'/../config.json'));
  }
  return config;
}

