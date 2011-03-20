
// built-in modules
var events = require('events'),
    util = require('util'),
    net = require('net'),
    tls = require('tls');

// internal modules
var func = require('./func.js');

var IRCClient = function(host, port, options) {
  this.options = options || {};
  this.options = func.object_merge(IRCClient.default_options, this.options);
console.log(util.inspect(this.options));
  this.host = host;
  this.port = port;

  events.EventEmitter.call(this);
};

IRCClient.default_options = {
  nickname: 'yourircnode-ircclient',
  realname: 'YourIRCNode',
  username: 'yourircnode',
  password: null,
  use_ssl: false,
  encoding: 'utf8'
};

util.inherits(IRCClient, events.EventEmitter);

/**
 * Establish IRC connection, emit 'connected' after irc motd received.
 */
IRCClient.prototype.connect = function() {
  var self=this;
  
  console.log(util.inspect(self.options));
  console.log('host:'+self.host+' port:'+self.port);

  var connect_reg = function() {
    if(self.options.password) {
      self.pass(self.options.password);
    }

    self.nick(self.options.nickname);
    self.user(self.options.username, self.options.realname);
  };

  if(self.options.use_ssl) {
    self.socket = tls.connect(self.port, self.host, function() {
      connect_reg();
    });
  }
  else {
    self.socket = net.createConnection(self.port, self.host);
    self.socket.on('connect', function() {
      connect_reg();
    });
  }
  self.socket.setEncoding(self.options.encoding);
  self.buffer = '';
  self.socket.on('data', function(chunk) { console.log('$ '+chunk);
    var n = null;
    self.buffer += chunk;

    if((n = self.buffer.lastIndexOf('\r\n')) != -1) {
      var lines = self.buffer.substr(0,n).split(/\r\n/);
      self.buffer.slice(0,n);
      for(var i = 0; i < lines.length; i++) {
        self.parseDelegate(lines[i]);
      } 
    }
  });
  self.socket.on('end', function() {
    console.log('end')
  });
  self.socket.on('error', function(exception) {
    self.emit('error', exception);
  });

  self.on('cmd:ping', function(message) {
    self.pong(message.params[0]);
  });
  self.on('cmd:code', function(message) {
    if(message.code == 376) { // end motd
      self.emit('connected');
    }
  });
};

IRCClient.prototype.send = function() {
  var args = Array.prototype.slice.call(arguments);
  console.log(args.join(' '))
  this.socket.write(args.join(' ')+'\r\n');
};

IRCClient.prototype.pass = function(password) {
  this.send('PASS', password);
} 

IRCClient.prototype.nick = function(nickname) {
  this.send('NICK', nickname);
} 

IRCClient.prototype.user = function(username, realname, modemask) {
  modemask = modemask || 0;
  this.send('USER', username, modemask, '*', ':'+realname);
} 

IRCClient.prototype.oper = function(user, password) {
  this.send('OPER', user, password);
}

IRCClient.prototype.quit = function(message) {
  this.send('QUIT', message);
}

IRCClient.prototype.join = function(channel, keyword) {
  this.send('JOIN', channel, keyword);
}

IRCClient.prototype.part = function(channel) {
  this.send('PART', channel);
}

IRCClient.prototype.pong = function(daemon) {
  this.send('PONG', daemon);
}

IRCClient.prototype.privmsg = function(target, message) {
  this.send('PRIVMSG', target, ':'+message);
}

// ...

IRCClient.prototype.parseDelegate = function(line) {
  var parts = line.split(/ /g),
      message = {
        source: null,
        command: null,
        params: []
      };

  // first element is source (optional)
  if(parts[0].charAt(0) == ':') {
    message.source = parts.shift();
  }
  message.command = parts.shift();

  if(!isNaN(message.command)) {
    message.code = parseInt(message.command, 10);
    message.command = 'code';
  }

  var trailing = false;
  for(var i = 0; i < parts.length; i++) {
    if(trailing) {
      message.params[message.params.length-1] += ' '+parts[i];
    }
    else if(parts[i].charAt(0) == ':') {
      trailing = true;
      message.params.push(parts[i].substr(1));
    }
    else {
      message.params.push(parts[i]);
    }
  }
  console.log('delegate cmd:'+message.command.toLowerCase()+' ('+util.inspect(message.params)+')')
  this.emit('cmd:'+message.command.toLowerCase(), message);
};

exports.IRCClient = IRCClient;

