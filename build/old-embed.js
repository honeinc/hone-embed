(function( window, document ){

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

/* global top, self, Emitter, onPostEmitterReady, require, module */
'use strict';

var isComponent = ( typeof module === 'object' ) && ( 'require' in window ), 
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
    if ( !( 'querySelector' in document ) ) {
        this._emitter.emit( 'error', new Error( '"querySelector" is needed to target iframe' ) );
        return;
    }
    return document.querySelector( selector );
};

PostEmitter.prototype.on = function( ) {
    this._emitter.on.apply( this._emitter, arguments );    
};

PostEmitter.prototype.emit = function( ) {

    // splits the arguments into a nice array
    var args = Array.prototype.slice.call(arguments, 0),
        event = this.serialize( args );

    var target = this.isIframe ? window.parent : ( this.el ? this.el.contentWindow : null );
    if ( !target ) return; // this should have emitted an error already;
    // emit to the correct location
    if ( typeof target.postMessage !== 'function' ) {
        this._emitter.emit( 'error', new Error( event[0] + ' not sent,' + 
            '"postMessage" is needed to communicate with iframe' ) );
        return;
    }
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
        this._emitter.emit( 'error', new Error( 'could not parse event: ' + e.data ) );
        return;
    }

    if ( !Array.isArray( msg ) )
    {
        this._emitter.emit( 'error', new Error( 'expected an array from postMessage instead got: ' + e.data ) );
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
    if ( !('addEventListener' in window && Function.prototype.hasOwnProperty( 'bind' )) ) {
        return this._emitter.emit( 'error', new Error( '"addEventListener" & ".bind()" needed to listen for messages'  ) );
    }
    window.addEventListener('message', this.onMessage.bind( this ), false );
};

PostEmitter.inIframe = isIframe;

if ( isComponent ) {
    module.exports = PostEmitter;
}

if( typeof onPostEmitterReady === 'function' ) {
    onPostEmitterReady( PostEmitter );
}


/* global PostEmitter, onHoneReady */

'use strict';

/* Hone - Constructor
 *
 * a options { Object } is passed to the function
 * this in turn is passed to the postEmitter Constructor
 *
 * - options.selector** - required { String } 
 * - options.prefix** - required  { String } 
 * - options.hone - optional { Object }
 *   - object containing contestId ( ref on current embed implementation )
 * ** are required by postEmitter
 */

function Hone ( options ) {
    this.options = options || {};
    this.current = this.options.hone;
    this.postEmitter = new PostEmitter( this.options );
    this.el = this.postEmitter.el;
}

/* Hone::setSrc
 *
 * a opts or options { Object } is passed to the function
 *
 * - opts.domain { String }
 *   - the domain to point the iframe at eg. 'http://localhost:8000'
 * - opts.debug { Boolean }
 *   - set to a truthy value to append debug=true onto the iframe url
 * - opts.ad { Boolean }
 *   - set a truthy value to use 'AdUnit' url rather then 'Contest'
 */

Hone.prototype.setSrc = function ( opts ) {
    var domain = opts.domain || 'http://gohone.com',
        debug = opts.debug ? '&debug=true' : '',
        type = opts.ad ? 'AdUnit' : 'Quiz',
        id = this.el.getAttribute( 'data-hone' );

    this.el.src = domain + '/' + type + '/' + id + '?embed=true' + debug;
};

/* Hone::onIframeResize ~ not yet implemented
 *
 * a defered excution function or thunk handling resize event 
 * comming from the iframe to adjust height.
 */

Hone.prototype.onIframeResize = function ( ) {
    var el = this.postEmitter.el;
    return function ( e ) {
        // should only have to control height
        if ( typeof e.clientHeight !== 'number' ) return;
        el.style.height = e.clientHeight + 'px';
    };
};

/* Hone::on
 *
 * a proxy for Component/Emitter::on method. Pass in a string with a event name 
 * and a handler for more visit - https://github.com/component/emitter
 *
 * - eventName { String }
 *   - eventName to consume with handler. Eg. 'vote'
 * - handler { Function }
 *   - a function to handle event when event is emitted
 */

Hone.prototype.on = function ( ) {
    this.postEmitter.on.apply( this.postEmitter, arguments ); 
};

/* Hone::on
 *
 * a proxy for Component/Emitter::emit method. Pass in a string with a event name 
 * and a payload of data - https://github.com/component/emitter
 *
 * - eventName { String }
 *   - eventName to consume with handler. Eg. 'vote'
 * - ... { Mixed }
 *   - the data you would like to send with event consumed in the iframe
 *     can be just about anything except functions ( due to serialization )
 */

Hone.prototype.emit = function ( ) {
    // we can hijack the emitter here and post it with the id.
    this.postEmitter.emit.apply( this.postEmitter, arguments ); 
};

/* Hone::urlParser || Hone.urlParser
 *
 * a way to parse ContestId out of url for exsisting iframes
 *
 * - url { String }
 *   - a Hone contest url eg. 'http://gohone.com/Contest/5319243f5067cac36f9cc617?embed=true'
 * - returns { Undefined || Object }
 *   - object will container contestId
 *   - if a bad url is passed in it will result in a undefined value being returned
 */

Hone.prototype.urlParser =
Hone.urlParser = function ( url ) {
    var resource, id;
    // we should just be looking at contest urls.
    if ( typeof url !== 'string' ) return;
    url = url.split(/\//);
    resource = url[ url.length - 2 ];
    id = url[ url.length - 1 ];
    if ( !resource ) return;
    if ( resource.toLowerCase() !== 'contest' ) return;
    id = id.split(/\?/).shift();
    return {
        contestId : id,
        isContest : true 
    };
};

/* Hone::init
 *
 * a init function to build url when called, pass in a opts { Object }
 * to configure iframe
 *
 * - opts { Object }
 *   - opts.resize { Boolean }
 *     - this will allow the iframe to resize its height to the content of
 *       the iframe
 *   - please reference Hone::setSrc
 */

Hone.prototype.init = function ( opts ) {
    opts = opts || {};
    if ( !this.el.src ) this.setSrc( opts );
    if ( opts.resize || this.el.getAttribute( 'data-resize' ) ) {
        this.on('resize', this.onIframeResize());
    }
};

/* initializing Hone
 * this block of code initializes a Hone Contructor with some basic options
 */

var el = ('querySelector' in document) ? document.querySelector('[data-hone]') : null,
    url, 
    hone;

// Check if embedded hone is present.
if ( el ) {
    url = el.src;
    hone = new Hone({
        selector : '[data-hone]',
        hone : Hone.urlParser( url ) || {},
        prefix : 'Hone:'
    });
}

/* exporting hone instance
 * this is how we export hone, there is the global option or readyHandler option
 * - the global option simply exports hone to window.hone
 *   - in this option script need to be loaded before usage so hone var is available
 * - the readyHandler option allow you to get a referance to hone once it has loaded
 *   - in this option the script should be loaded after one method is to defer you 
 *     script loading eg. '<script src="path-to/embed.js" defer></script>'
 */

if ( typeof onHoneReady === 'function' ) return onHoneReady( hone );
window.hone = hone;

}( window, document ));