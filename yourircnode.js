
var config = require('./lib/config.js').load(),
    routes = require('./lib/routes.js');

var fs = require('fs'),
    http = require('http'),
    https = require('https');

var IRCClient = require('./lib/irc.js').IRCClient;
var io = require('socket.io');

// create http server with ssl
if(config.server.use_ssl) {
  var server = https.createServer(
    {
      key: fs.readFileSync(config.server.ssl.key),
      cert: fs.readFileSync(config.server.ssl.cert)
    },
    routes.handleRequest
  );
}
// create http server
else {
  var server = http.createServer(routes.handleRequest);
}

server.listen(config.server.port, config.server.bind);

var conn = null;
var socket = io.listen(server);
socket.on('connection', function(client) {
  console.log('socket.io client connection established');
  client.on('message', function(message) {
    console.log('socket.io client sent : '+message);

    if(message.indexOf('/connect') == 0) {
      conn = new IRCClient('irc.teranetworks.de', 6697, {use_ssl: true})
      conn.on('error', function(exception) {
        console.log('error: '+exception)
      });
      conn.on('connected', function() {
        console.log('connected emit')
        conn.join('#woot');
      });
      conn.on('cmd:privmsg', function(message) {
        var line = '<'+message.params[0]+'/'+message.source+'> '+message.params[1];
        console.log(line)
        client.send(line)
      });
      conn.connect();
    }
    else {
      if(conn) {
        conn.privmsg('#woot', message)
      }
      else {

      }
    }
  });
  client.on('disconnect', function() {
    console.log('socket.io client disconnected.');
  });
});





