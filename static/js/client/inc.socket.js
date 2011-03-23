
//
// Code for socket.io communication with server
//

socket = new io.Socket(HOST, {port: PORT, secure: SSL});

socket.on('connect', function() {
  tabs.send('socket.io connection established using '+socket.transport.type+' transport');
});

socket.on('disconnect', function() {
  tabs.send('socket.io connection lost');
});

socket.on('message', function(data) {
  tabs.send('socket.io message received: '+data);
});

socket.connect();

