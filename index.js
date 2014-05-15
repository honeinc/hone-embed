/* global top, self, Emitter, onPostEmitterReady */
'use strict';

var supported = ( 'postMessage' in window ) && 
        ( Function.prototype.hasOwnProperty( 'bind' ) ) &&
        ( 'JSON' in window ),
    isComponent = ( typeof module === 'object' ) && 
        ( 'require' in window ), 
    isIframe = (top !== self),
    _Emitter;

if ( isComponent ) {
    _Emitter = require('emitter');
} else {
    _Emitter = Emitter;
}

/*
 * Constructor sets up some simple listeners and
 * gets the element.
 */

function PostEmitter( options ) {
    if ( !supported ) {
        // for now
        return;
    }

    // setting basic vars
    this.isIframe = isIframe;
    this.options = options || {};
    this._emitter = new _Emitter( );
    this.el = (isIframe) ? null : this.getFrame( this.options.selector );
    this.prefix = new RegExp( '^' + this.options.prefix );
    this.prefixLength = this.options.prefix.length;
    this.setOrigin( this.options.origin );
    this.addListener();
}

/*
 * Selects a iframe based off the id passed to it
 */

PostEmitter.prototype.getFrame = function ( selector ) {
    return document.querySelector( selector );
};

PostEmitter.prototype.on = function( ) {
    this._emitter.on.apply( this._emitter, arguments );    
};

PostEmitter.prototype.emit = function( ) {

    // splits the arguments into a nice array
    var args = Array.prototype.slice.call(arguments, 0),
        event = this.serialize( args );

    var target = this.isIframe ? window.parent : this.el.contentWindow;
    // emit to the correct location
    target.postMessage( event, this._origin );
};

PostEmitter.prototype.setOrigin = function ( origin ) {
    this._origin = origin || '*';
};

PostEmitter.prototype.onMessage = function ( e ) {

    // return if it doesnt have a good prefix
    if ( !this.prefix.test( e.data ) )
    {
        return;
    }

    var msg = this.deserialize( e.data );
    if ( !msg )
    {
        this._emitter.emit( 'error', new Error( 'PostEmitter could not parse event: ' + e.data ) );
        return;
    }
    
    if ( !Array.isArray( msg ) )
    {
        this._emitter.emit( 'error', new Error( 'PostEmitter expects arrays from events. Did not get an array from event: ' + e.data ) );
        return;
    }

    this._emitter.emit.apply( this._emitter, msg );
};

PostEmitter.prototype.deserialize = function ( msg ) {
    
    var json = msg.slice( this.prefixLength );
    var obj = null;
    try
    {
        obj = JSON.parse( json );
    }
    catch ( e )
    {
        obj = null;
        this.emit( 'error', e );
    }
    
    return obj;
};

PostEmitter.prototype.serialize = function ( msg ) {
    return this.options.prefix + JSON.stringify(msg);
};

PostEmitter.prototype.addListener = function ( ) {
    window.addEventListener('message', this.onMessage.bind( this ), false );
};

PostEmitter.inIframe = isIframe;

if ( isComponent ) {
    module.exports = PostEmitter;
}

if( typeof onPostEmitterReady === 'function' ) {
    onPostEmitterReady( PostEmitter );
}
