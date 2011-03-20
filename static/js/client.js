//
// Client Core tab setup and keybindings
//

// globals
var tab_send = null;
var socket = null;

$(document).ready(function() {

  var tabkeys = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'  
  ];


  // initialize tabs
  var tabs = $('#tabs').tabs({
    select: function(event, ui) {
      tab_send('tab: '+tab_sel())
      tab_nohl(tab_sel()-1);
    }
  });

  var tab_sel = function() {
    return $('#tabs').tabs('option', 'selected');
  };

  var tab_len = function() {
    return $('#tabs').tabs('length');
  };

  var tab_nav = function(tab) {
    return $('.ui-tabs-nav > li:nth-child('+(tab)+') > a');
  }

  var tab_nohl = function(tab) {
    var navlink = tab_nav(tab);
    if(navlink) {
      navlink.removeAttr('style');
    }
  }

  tab_send = function(message, tab) {
    // default tab == status
    tab = tab || 1;
    $('#tabs-'+tab).append(message + '<br />')
      .attr({scrollTop: $('#tabs-'+tab).attr('scrollHeight')});

    if(tab_sel()+1 != tab) {
      var navlink = tab_nav(tab);
      if(navlink) {
        navlink.css('color', 'red');
      }
    }
  }

  var tab_switch = function(index) {
    if(index > tab_len() || index == tab_sel()) {
      //return false;
    }
    tab_send('[tabs] switch to tab #'+index);
    $('#tabs').tabs('select', index-1);
    $('#tabs-'+index).attr({scrollTop: $('#tabs-'+index).attr('scrollHeight')});
    // reset tab highlight
  }

  var tab_labels = [];
  var tab_create = function(name) {
    var next_tab_id = '#tabs-'+(tab_len() + 1),
        next_tab_key = tabkeys[tab_len()];

    tabs.tabs('add', next_tab_id, '['+next_tab_key+'] '+name);
    // $(next_tab_id).html('foo... bar');

    tab_send('[tabs] create new tab with label='+name);
    tab_labels.push(name);
  };



  //
  // Resize tab panel height to full window height
  //
  var tab_bottom_margin = 35;
  function resizeUi() {
      var h = $(window).height();
      var w = $(window).width();
      $("#tabs").css('height', h-95+tab_bottom_margin);
      $(".ui-tabs-panel").css('height', h-140-38+tab_bottom_margin);
  };
  var resizeTimer = null;
  $(window).bind('resize', function() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeUi, 100);
  });
  resizeUi();


  //
  // default keymapping:
  //
  var keymap = {
    '<Space>': function() {
      if(!input.has_focus) {
        input.focus();
        return false;
      }
      return true;
    }
  };

  for(var i=0; i < tabkeys.length; i++) {
    (function() {
      var tab = i + 1;
      keymap['<M-'+tabkeys[i]+'>'] = function(event) {
        return tab_switch(tab);

      };                                 
      return false;
    })();
  }

  //
  // client commands
  //
  var client_commands = {
    open: function(params) {
      var label = (params && params.length >= 1) ? params.join(' ') : null;
      if(label) {
        tab_create(label);
      }
    },
    send: function(params) {
      var tab = 1, // default tab
          message = params.slice(1).join(' ');

      if(!isNaN(params[0])) {
        tab = parseInt(params[0], 10);
      }
      else {
        tab = tab_labels.indexOf(params[0])+2;
      }

      tab_send(message, tab);
    }
  };


        tab_create('#test');
  //
  // text input
  //
  var input = $('#input');

  // keep track of input focus and focus on load
  input.focus(function() {
    input.has_focus = true;
  })
  .blur(function() {
    input.has_focus = false;
  })
  .focus();

  var input_history = [];
  var input_history_ptr = 1;

  $('#input-form').submit(function(event) {
    event.preventDefault();
    var command = input.val();
    if(command == '') {
      return;
    }
    if(command != input_history[input_history.length-1]) {
      input_history.push(command);
      input_history_ptr = input_history.length;
    }
    
    // client side commands start with :
    if(command.charAt(0) == ':') {
      var endofc = command.indexOf(' ');

      var name = (endofc != -1) ? command.substr(1, endofc-1) : command.substr(1);

      if(endofc != -1) {
        var params = command.substr(endofc+1).split(' ');
      }

      if(client_commands[name]) {
        tab_send('[input] delegate client command: '+name);
        if(params) {
          client_commands[name](params);
        }
        else {
          client_commands[name]();
        }
      }
      
    }

    // default: send to server
    else {
      // escaped : -> /:
      if(command.substr(0,2) == '/:') {
        command = command.substr(1);
      } 

      tab_send('[input] server socket command: '+command);
      if(socket) {
        socket.send(command)
      }
    }

    input.val('');
  });  
  // History Keymap: PREV
  keymap['<A-UP>'] = function() {
    if(input_history_ptr > 0) {
      input_history_ptr--;
    }

    input.val(input_history[input_history_ptr])
      .focus();
  };
  // History Keymap: NEXT
  keymap['<A-DOWN>'] = function() {
    if(input_history_ptr < input_history.length) {
      input_history_ptr++;
    }

    input.val(input_history[input_history_ptr])
      .focus();
  };


  //
  // Load other client files
  //
  var files = ['client_socket.js'];
  for(var i=0; i < files.length; i++) {
    (function() {
      var script_path = '/static/js/'+files[i];
      $.getScript(script_path, function() {
        tab_send('Load script: '+script_path);
      });
    })();
  }


  //
  // bind keymap
  // << Keep last so other features can bind their
  //    keys to keymap >>
  //
  var keylock = new Keylock();
  keylock.define(keymap);
  $(document).keydown(function(event) {
    if(!keylock.trigger(event)) {
      event.preventDefault();
    }
  });
});

