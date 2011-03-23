// http://stackoverflow.com/questions/690781/debugging-scripts-added-via-jquery-getscript-function
// ::
// Replace the normal jQuery getScript function with one that supports
// debugging and which references the script files as external resources
// rather than inline.
jQuery.extend({
   getScript: function(url, callback) {
      var head = document.getElementsByTagName("head")[0];
      var script = document.createElement("script");
      script.src = url;

      // Handle Script loading
      {
         var done = false;

         // Attach handlers for all browsers
         script.onload = script.onreadystatechange = function(){
            if ( !done && (!this.readyState ||
                  this.readyState == "loaded" || this.readyState == "complete") ) {
               done = true;
               if (callback)
                  callback();

               // Handle memory leak in IE
               script.onload = script.onreadystatechange = null;
            }
         };
      }

      head.appendChild(script);

      // We handle everything using the script element injection
      return undefined;
   },
});

/**
 * Initialize Global Keymapping using keylock, 
 * load other script components. 
 */

// global keybindings object the components can bind their functionality here
var keybind = {};

$(document).ready(function() {
  var components = [
    'keymap', // contains all keymappings used by other components
    'tabs', // initialize the tabs module for controlling the jquery-ui tabs
    'socket', // initialize the socket.io connection
    'input', // initialize and bind the input textfield keybindings/events
  ];

  var initKeybindings = function() {
    console.log('[yourircnode] initialize keybindings');
    $(document).keylock(keybind);
  };

  var loadComponent = function(index) {
    var script = '/static/js/client/inc.' + components[index] + '.js';

    $.getScript(script, function() {
      console.log('[yourircnode] component script loaded: ' + script);

      index++;
      if(index >= components.length) { // last component loaded
        initKeybindings();
      }
      else {
        loadComponent(index);
      }
    });
  };
  loadComponent(0);

}); // end jquery document ready event

