var tabs = {

  // settings:
  settings: {
    bottom: 55, // bottom margin
    switch_default: false, // key binding return if switching fails

  },

  init: function() {
    // attributes:
    this.identifiers = ['status']; // to store the internal identifier (known by server)
    this.active = 0; // active tab (default: status)
    this.switch_keys = keymap.tabs_switch_keys;

    // bind keys to switch tabs:
    var self = this;
    for(var i = 0; i < this.switch_keys.length; i++) {
      (function() {
        var index = i;
        keybind['<' + keymap.tabs_switch_mod + '-' + self.switch_keys[index] + '>'] = function(event) {
          if(self.switch(index)) {
            return false;
          }
          return self.settings.switch_default;
        };                                 
      })();
    }

    // init jquery-ui tabs:
    this.container = $('#tabs').tabs();
    this.panels = $(".ui-tabs-panel");

    // resize for viewport size and resize events
    // initial resize:
    this.resize();

    return this;
  },

  // resize height of tabs container to viewport size
  resize: function() {
    var self = this;
    var resize = function() {
      var height = $(window).height(),
          width = $(window).width();

      self.container.css('height', height - self.settings.bottom);
      self.panels.css('height', height - self.settings.bottom + 7);
    };

    var resize_timer = null;
    $(window).bind('resize', function() {
      if(resize_timer) {
        clearTimeout(resize_timer);
      }
      resize_timer = setTimeout(resize, 100);
    });

    resize();
  },

  /**
   * Create a new (empty) Tab (without switching to it!)
   *
   * The identifier must be unique, it is used to address the tabs from the server.
   */
  open: function(name, identifier) {
    if(this.identifiers.indexOf(identifier) != -1) {
      console.log('WARNING: non-unique identifier for open tab ignored');
      return;
    }

    // store new identifier to be able to adress them internally later
    this.identifiers.push(identifier);
    var index = this.identifiers.length - 1;

    // assign the switch key of the *next* tab or use the client command:
    var switch_key = this.switch_keys[index] || ':s ' + index;

    // caption used for tab navigation bar
    var caption = '[' + switch_key + '=' + index + '] ' + name;

    // add new tab
    this.container.tabs('add', '#tabs-'+index, caption);
  },

  close: function(identifier) {
    identifier = this.resolveIdentifier(identifier);
    if(!this.existingIdentifier(identifier)) {
      return false;
    }
    else {
      // impossible to remove status tab
      if(identifier == 0) {
        return;
      }

      this.container.tabs('remove', identifier); 

      // not last in line? rename following tab ids
      if(identifier != this.identifiers.length-1) {
        for(var i = identifier; i < this.identifiers.length-1; i++) {
          $('#tabs-'+(i+1)).attr('id', 'tabs-'+i);
          var navigation = $('.ui-state-default a[href="#tabs-'+(i+1)+'"]');
          if(!navigation) {
            continue;
          }

          // rename href
          navigation.attr('href', '#tabs-'+i);

          // rename caption // UGLY HACK! but i don't store the name just for this, fuck should I?
          var caption = $('span', navigation).html();
          if(!caption) {
            console.log('WARNING: empty caption for nav: #tabs-'+i);
            continue;
          }
          caption = caption.replace(/^\[[^=]+=\d+\]/, '['+(this.switch_keys[i] || (':s ' + i))+'='+i+']');
          $('span', navigation).html(caption);
        }
      }

      // removed tab == active tab? switch to previous tab

      return true;
    }
  },

  /**
   * Switch to tab specified in the identifier
   */
  switch: function(identifier) {
    identifier = this.resolveIdentifier(identifier);
    if(!this.existingIdentifier(identifier)) {
      return false;
    }
    else {
      this.active = identifier;
      this.container.tabs('select', identifier);
      this.scrollToBottom();

      return true;
    }
  },

  /**
   * Send message to tab, if no identifier is specified the message is
   * sent to the first (status) tab.
   */
  send: function(message, identifier) {
    identifier = this.resolveIdentifier(identifier);
    if(!this.existingIdentifier(identifier)) {
      return false;
    }

    $('#tabs-'+identifier).append(message + '<br />');
    this.scrollToBottom();
  },

  /**
   * Resolve Identifier to index of tab (starting by 0)
   */
  resolveIdentifier: function(identifier) {
    identifier = identifier || 'status';

    // resolve to tab index
    if(isNaN(identifier)) {
      identifier = this.identifiers.indexOf(identifier);
    }

    return identifier;
  },

  /**
   * Returns true if the identifier exists.
   */
  existingIdentifier: function(identifier) {
    if(identifier < 0 || identifier >= this.identifiers.length) {
      return false;
    }
    else {
      return true;
    }
  },

  /**
   * Scroll to the bottom of the active tab
   */
  scrollToBottom: function() {
    var active = $('#tabs-' + this.active);
    active.attr({scrollTop: active.attr('scrollHeight')});
  }

}.init();

