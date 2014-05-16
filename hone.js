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

Hone.prototype = this;

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
    var domain = this.domain,
        debug = opts.debug ? '&debug=true' : '',
        type = opts.ad ? 'AdUnit' : 'Contest',
        id = this.el.dataset.hone;

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
    this.domain = opts.domain || 'http://gohone.com'; 
    if ( !this.el.src ) this.setSrc( opts );
    if ( opts.resize || this.el.dataset.resize ) {
        this.on('resize', this.onIframeResize());
    }
    if ( opts.autoTarget && this.AutoTarget ) { 
        opts.hone = this;
        this.autoTarget = new (this.AutoTarget)( opts );
    }
};

/* initializing Hone
 * this block of code initializes a Hone Contructor with some basic options
 */

var el = document.querySelector('[data-hone]'),
    url = el.src,
    hone = new Hone({
        selector : '[data-hone]',
        hone : Hone.urlParser( url ) || {},
        prefix : 'Hone:'
    });

/* exporting hone instance
 * this is how we export hone, there is the global option or readyHandler option
 * - the global option simply exports hone to window.hone
 *   - in this option script need to be loaded before usage so hone var is available
 * - the readyHandler option allow you to get a referance to hone once it has loaded
 *   - in this option the script should be loaded after one method is to defer you 
 *     script loading eg. '<script src="path-to/embed.js" defer></script>'
 */

if ( typeof onHoneReady === 'function' ) {
    onHoneReady( hone );
} else {
    window.hone = hone;
}