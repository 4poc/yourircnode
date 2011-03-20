
var util = require('util'),
    fs = require('fs');

var config = require('./config.js').load(),
    func = require('./func.js');
 
var dust = require('dust');

var cache = {};
var load = function(name) {
  var filename = __dirname+'/../dust/'+name+'.html';
  if(!func.file_exists(filename)) {
    throw 'nope';
  }

  if(!cache[name]) {
    if(!config.template.compress) {
      dust.optimizers.format = function(ctx, node) { return node };
    }
    content = fs.readFileSync(filename, 'utf-8');
    cache[name] = dust.compile(content, name);
    dust.loadSource(cache[name]);
  }
  return cache[name];
}
exports.load = load;

var renderResponse = function(response, name, context) {
  load(name);
  dust.stream(name, context)
      .on("data", function(data) {
        response.write(data);
      })
      .on("end", function() {
        response.end();
      })
      .on("error", function(err) {
        response.writeHead(500, {
          'Content-Type': 'text/html'
        });
        response.end('dust render error: '+err);
        console.log('dust error: '+err);
      });
}
exports.renderResponse = renderResponse;


