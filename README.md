# log4js-fayeAppender

log4js-fayeAppender is a custom appender for log4js capable of publishing log to a [faye server](http://faye.jcoglan.com/)

## Install

Automated installation is not yet available through npm, but simply put the log4js-fayeAppender folder in node_modules and install the dependencies by running:

    cd log4js-fayeAppender
    npm install

## Usage

Simply configure the appender with *url* and *channel* parameters:

    log4js.configure({
        appenders: [
            {type: 'log4js-fayeAppender', url: 'http://localhost:8000', channel: '/faye'},
            {type: 'console'}
        ]
    });

When log4js fails to find a given appender in its own library, it attempts to find it in node_modules, which is why you do not need to explicitly require anything other than log4js.
This implies that, in order to work properly, **log4js-fayeAppender itself must reside inside a node_modules directory**.

## Examples

The examples folder contains 4 elements:

* *fayeServer* which is a textbook faye server sample (in our case, the log aggregator)
* *logger* which is a sample code showing how to use log4js-fayeAppender
* *subscriber* which is a simple node client to take a look at what the server pushes to its subscribers
* *www* a simple web log viewer

Note that while log4js-fayeAppender as a module does not depend directly on log4js, *logger.js* does depend on log4js and so you must install it for it to run:

    npm install log4js

Now, the simplest way to test this is to have 2 terminals and one browser:

1. run *node fayeServer.js*
2. open *www/index.html* inside your favorite browser
3. run *node logger.js*

## Credits

A previous effort of realizing a faye custom appender was carried out by [Jim Alateras](https://www.npmjs.org/package/log4js-faye)

## License

MIT

Copyright (c) 2014 bitcraft Co. Ltd.