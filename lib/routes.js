
var util = require('util'),
    fs = require('fs'),
    uri = require('url');

var config = require('./config.js').load(),
    func = require('./func.js'),
    template = require('./template.js');
 
var Cookies = require('cookies');

var cookies = null;

var routes = [];
var get = function(pattern, callback) {
  routes.push({
    method: 'GET',
    pattern: pattern,
    callback: callback
  });
}

var CONTENT_TYPES = {
  'js': 'application/x-javascript',
  'css': 'text/css',
  'png': 'image/png'
};
get('/static/(.*)', function(request, response) {
  if(request.route_match[0].indexOf('..') != -1) {
    throw "invalid static route";
  }

  var static_file = __dirname+'/../static/'+request.route_match[1];
  if(func.file_exists(static_file)) {
    var ext = static_file.substr(static_file.lastIndexOf('.')+1);
    response.writeHead(200, {
      'Content-Type': CONTENT_TYPES[ext]
    });
    fs.readFile(static_file, function(error, data) {
      response.end(data);
    });
  }
});

get('/dust/(.*)\.html\.js', function(request, response) {
  response.end(template.load(request.route_match[1]))
});

get('/', function(request, response) {
  cookies.set('test', 42)
  var context = {
    host: config.server.host,
    port: config.server.port,
    ssl: config.server.use_ssl
  };
  template.renderResponse(response, 'index', context);
});



exports.handleRequest = function(request, response) {
  cookies = new Cookies(request, response);

  for(var i = 0; i < routes.length; i++) {
    var route = routes[i];
    if(request.method == route.method) {
      var path = uri.parse(request.url).pathname;
      request.route_match = (new RegExp('^'+route.pattern+'$', 'ig')).exec(path); // request.url);
      if(request.route_match) {
        try {
          console.log('delegate request: '+route.method+' '+request.url+' ['+route.pattern+']');
          route.callback(request, response);
          return;
          }
        catch(exception) {
          response.writeHead(500, {
            'Content-Type': 'text/html'
          });
          response.end('an error occured: '+exception);
          console.log(exception);
          return;
        }
      }
    } 
  }
  response.writeHead(404, {
    'Content-Type': 'text/html'
  });
  response.end('no route for url found');
}


