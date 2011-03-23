var input = {
  init: function() {
    this.element = $('#input');

    // keep track of input focus and blur
    var self = this;
    this.element.focus(function() {
      self.has_focus = true;
    });
    this.element.blur(function() {
      self.has_focus = false;
    });

    // focus on load
    this.element.focus();

    // initialize history
    this.history = [];
    this.history_active = 1;

    // register input textbox
    $('#input-form').submit(function(event) {
      self.submit(event);
    });

    // next in history
    keybind[keymap.input_history_next] = function() {
      if(self.history_active < self.history.length) {
        self.history_active++;
      }

      self.element.val(self.history[self.history_active])
        .focus();
    };

    // previous in history
    keybind[keymap.input_history_prev] = function() {
      if(self.history_active > 0) {
        self.history_active--;
      }

      self.element.val(self.history[self.history_active])
        .focus();
    };

    return this;
  },

  submit: function(event) {
    event.preventDefault();
    
    var command = this.element.val();
    if(command == '') {
      return;
    }

    // push command to history
    if(command != this.history[this.history.length-1]) {
      this.history.push(command);
      this.history_active = this.history.length;
    }
    
    // client commands start with :
    if(command.charAt(0) == ':') {
      this.delegateClientCommand(command);
    }

    // server commands with /
    else {
      this.delegateServerCommand(command);
    }

    this.element.val('');
  },

  delegateClientCommand: function(command) {
    var endofc = command.indexOf(' ');
    var name = (endofc != -1) ? command.substr(1, endofc-1) : command.substr(1);

    if(endofc != -1) {
      var params = command.substr(endofc+1).split(' ');
    }

    if(this.clientCommands[name]) {
      tabs.send('delegate execution of client command: '+name+' (parameters: '+JSON.stringify(params)+')');
      if(params) {
        this.clientCommands[name](params);
      }
      else {
        this.clientCommands[name]([]);
      }
    }
  },

  delegateServerCommand: function(command) {
  },

  clientCommands: {
    help: function() {
      tabs.send('client commands start with : most of these should only be called by the server');
      for(var key in this) {
        if(key.indexOf('help_') != -1) {
          tabs.send(this[key]);
        }
      }
    },

    help_open: ':open [name] [identifier] | open a new tab',
    open: function(params) {
      if(params.length == 2) {
        tabs.open(params[0], params[1]);
      }
    },

    help_close: ':close [identifier] | close a tab',
    close: function(params) {
      if(params.length == 1) {
        tabs.close(params[0]);
      }
    },

    help_send: ':send [identifier] [message] | send message to tab by identifier',
    send: function(params) {
      if(params.length >= 2) {
        tabs.send(params.splice(1).join(' '), params[0]);
      }
    },

    help_switch: ':switch [identifier] | switch to tab by identifier',
    switch: function(params) {
      if(params.length == 1) {
        tabs.switch(params[0]);
      }
    }
  }

}.init();

