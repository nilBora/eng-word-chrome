chrome.runtime.sendMessage( 'content.js', function ( config ) {
    if ( typeof( config ) === 'string' ) {
        config = $.parseJSON( config );
    }

    if ( !config || !config.css ) return;
    $( '<style>' + config.css + '</style>' ).appendTo( document.head || document.documentElement );


} );