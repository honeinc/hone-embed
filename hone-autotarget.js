'use strict';

/* this in this instance should be privatly scoped*/
this.AutoTarget = AutoTarget;

function AutoTarget ( opts ) {
    this.payload = this.getMeta();
    this.url = opts.domain + '/api/1.0/recommendations/contest';
    this.request( function ( err, res ) {
        if ( err ) return; /* might be nice to show an error page */
    } );
}

AutoTarget.prototype.request = function( url, data ) {
    if ( !this.hasXHR ) {
        return;
    }
    var xhr = new XMLHttpRequest( );

    // xhr.

};

AutoTarget.prototype.hasXHR = function ( ) {
    if ( 'XMLHttpRequest' in window ){
        return true;
    }
};

AutoTarget.prototype.getMeta = function ( ) {
    var meta = document.getElementsByTagName('meta'),
        payload = {};
    meta.forEach( function ( metaTag ) {
        var name = metaTag.name,
            content = metaTag.content;
        payload[ name ] = content;
    });
    return payload;
};