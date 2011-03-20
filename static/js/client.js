
var test = function(message) {
  $('#test').append(message+'<br>\n');
  $("#test").attr({ scrollTop: $("#test").attr("scrollHeight") });
}


$(document).ready(function() {

  var options = {
    port: PORT,
    secure: SSL
  };

  var socket = new io.Socket(HOST, options);
  socket.on('connect', function() {
    test('socket.io connection established // transport: '+socket.transport.type)
  });
  socket.on('disconnect', function() {
    test('socket.io connection disconnected')
  });
  socket.on('message', function(data) {
    test('received socket.io message: '+data)
  });
  socket.connect();
  
  $('#input-form').submit(function(event) {
    var input = $('#input-form > input')
    if(input.val() == '') {
      event.preventDefault();
      return;
    }
    if(socket.connected) {
      test('sending... '+input.val())
       socket.send(input.val());
    }
    else {
      test('<<socket.io not connected>>')
    }
    input.val('');
    event.preventDefault();
  });

});

