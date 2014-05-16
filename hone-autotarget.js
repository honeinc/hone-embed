'use strict';

/* this in this instance should be privatly scoped*/
this.AutoTarget = AutoTarget;

function AutoTarget ( opts ) {

    var self = this;
    this.hone = opts.hone;
    this.payload = this._getMeta();
    this.url = this.hone.domain + '/api/1.0/Recommendations/Contests';
    // does request
    this.xhr = this.request( function ( err, res ) {
        console.log( arguments );  
        if ( err ) {
            return this.hone._emitter.emit( 'error', err );
        } 
        // parse through results and use
        // this.hone.setSrc
    }.bind( this ));

}

AutoTarget.prototype.request = function( callback ) {
    
    if ( !this.hasXHR ) {
        return;
    }

    var xhr = new XMLHttpRequest( );

    xhr.open( 'GET', this.url + '?' + this.qsSerialize( this.payload ), true );
    xhr.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
    xhr.send( );
    xhr.onReadyStatechange = this.onReadyStatechange.bind( this, callback );
    return xhr;
};

AutoTarget.prototype.qsSerialize = function ( obj ) {
    var keyVals = [];
    for(var key in obj) { 
        if (obj.hasOwnProperty(key)) {
            keyVals.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
        }
    }
    return keyVals.join("&");
};

AutoTarget.prototype.onReadyStatechange = function ( callback, e ) {
    var res;
    if (this.xhr.readyState !== 4) {
        return;
    }
    if ( this.xhr.status !== 200 ) {
        callback( new Error( this.xhr.responseText ));
        return;
    }
    try {
        res = JSON.parse( this.xhr.responseText );
    } catch ( e ) {
        res = null;
        return callback( new Error( 'Unable to parse:' + this.xhr.responseText ));
    }
    callback( null, res );
};


AutoTarget.prototype.hasXHR = function ( ) {

    if ( 'XMLHttpRequest' in window ){
        return true;
    }

};

AutoTarget.prototype._getMeta = function ( ) {

    var meta = document.getElementsByTagName('meta'),
        payload = {};

    // make this a real array
    meta = Array.prototype.slice.call( meta );

    meta.forEach( function ( metaTag ) {
        var name = metaTag.name,
            content = metaTag.content;

        payload[ name ] = content;
    });

    return payload;
};