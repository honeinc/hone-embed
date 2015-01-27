
# Hone Embed

Simple interactions with embedded Hone Questions and Quizzes.


## Installation

If you copied the embeded code from the gohone.com interface you can just add a `data-hone` attribute to the iframe to enable the code to run against that embed.

```html
<iframe src="..." data-hone data-resize="true"></iframe>
```

optionally you can try out a beta feature that allows the iframe to resize its height dynamically to the content inside of the iframe by adding a `data-resize` attribute to the iframe.

Include the script into your page ( script located in `build` directory ).

```html
<script src="/path-to/embed.js"></script>
```

## Usage

After you load the script we export out a `hone` variable into the `window`, or global scope. First you need to initialize the script and then you can attach event bindings to that variable.

```javascript
hone.init( );
hone.on('buy_button_clicked', function( e ){
  console.log('Clicked the buy button');
});
```

## Available Events

- buy_button_clicked 
- commented
- facebook_invite_sent
- facebook_invite_cancelled
- facebook_linked
- facebook_unlinked
- invited
- item_detail_closed
- item_detail_opened
- logged_in
- logged_out
- navigating
- rendered
- searched
- signed_up
- voted

## Examples 

Checkout the `examples` directory


## Creating a build

Also if you want a minified version, you can build one. You will need [nodejs]( http://nodejs.org ) and [grunt]( http://gruntjs.com/ ).

    # to install global grunt run
    $ npm install -g grunt-cli 

Once you have those installed you can then run in your teminal.

    $ npm install

This will install all the development dependecies and then run

    $ grunt dist

This will create a `dist` directory and compile a script with the name `hone-embed-0.1.0.js` that file will be compressed and read to use in the scrip tag.

## Contributing

You will need `grunt` cli.

    $ npm install -g grunt-cli

Then install dev dependecies

    $ npm install

To build embed script and run server for examples

    $ grunt

Once you have a working piece of code open a pull request. :+1:


## License

The MIT License (MIT)

Copyright (c) 2014 Hone, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.