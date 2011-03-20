//
// Code for socket.io communication with server
//

var options = {
  port: PORT,
  secure: SSL
};

socket = new io.Socket(HOST, options);

socket.on('connect', function() {
  tab_send('[socket.io] connection established // transport: '+socket.transport.type);
});

socket.on('disconnect', function() {
//  test('socket.io connection disconnected')
});

socket.on('message', function(data) {
// test('received socket.io message: '+data)
  tab_send('[socket.io] received message: '+data)
});

socket.connect();

