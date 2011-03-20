
var IRCClient = require('./lib/irc.js').IRCClient;

var freenode = new IRCClient('irc.teranetworks.de', 6697, {use_ssl: true});
freenode.on('error', function(exception) {
  console.log('error: '+exception)
});
freenode.on('connected', function() {
  console.log('connected emit')
  freenode.join('#woot');
});
freenode.on('cmd:privmsg', function(message) {
  console.log('\n<'+message.params[0]+'/'+message.source+'> '+message.params[1]+'\n')
});
freenode.connect();

