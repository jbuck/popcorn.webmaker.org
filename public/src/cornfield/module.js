/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

define( [ "util/xhr" ], function( xhr ) {

  var Cornfield = function( butter ) {

    var authenticated = false,
        loggedInUser = document.querySelector( "meta[name=persona-email]" ).value,
        username = "",
        self = this;

    navigator.id.watch({
      loggedInUser: loggedInUser ? loggedInUser : null,
      realm: document.querySelector( "meta[name=sso-realm]" ).value,
      onlogin: function(assertion) {
        console.log("onlogin fired");

        xhr.post( "/persona/verify", { assertion: assertion }, function( res ) {
          console.log("logged in");

          authenticated = true;
          username = res.user.username;
          butter.dispatch( "authenticated" );
        });
      },
      onlogout: function() {
        console.log("onlogout fired");

        xhr.post( "/persona/logout", function() {
          console.log("logged out");

          authenticated = false;
          username = "";
          butter.dispatch( "logout" );
        });
      },
      onmatch: function() {
        console.log("onmatch fired");

        if ( document.querySelector( "meta[name=persona-email]" ).value) {
          console.log("logged in");

          authenticated = true;
          username = res.user.username;
          butter.dispatch( "authenticated" );
        } else {
          console.log("logged out");

          authenticated = false;
          username = "";
          butter.dispatch( "logout" );
        }
      },
    });

    this.username = function() {
      return username;
    };

    this.authenticated = function() {
      return authenticated;
    };

    function publishPlaceholder( id, callback ) {
      console.warn( "Warning: Popcorn Maker publish is already in progress. Ignoring request." );
      callback( { error: "Publish is already in progress. Ignoring request." } );
    }

    function publishFunction( id, callback ) {
      // Re-route successive calls to `publish` until a complete response has been
      // received from the server.
      self.publish = publishPlaceholder;

      xhr.post( "/api/publish/" + id, function( response ) {
        // Reset publish function to its original incarnation.
        self.publish = publishFunction;

        callback( response );
      });
    }

    function savePlaceholder( id, data, callback ) {
      console.warn( "Warning: Popcorn Maker save is already in progress. Ignoring request." );
      callback( { error: "Save is already in progress. Ignoring request." } );
    }

    function saveFunction( id, data, callback ) {
      // Re-route successive calls to `save` until a complete response has been
      // received from the server.
      self.save = savePlaceholder;

      var url = "/api/project/";

      if ( id ) {
        url += id;
      }

      xhr.post( url, data, function( response ) {
        // Reset save function to its original incarnation.
        self.save = saveFunction;

        callback( response );
      });
    }

    this.save = saveFunction;
    this.publish = publishFunction;

  };

  Cornfield.__moduleName = "cornfield";

  return Cornfield;
});
