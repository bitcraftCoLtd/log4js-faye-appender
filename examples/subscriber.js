/**
 * Example of faye client subscribing to the aggregated log in node app
 */

'use strict';

var Faye = require('faye'),
    util = require('util');

var client = new Faye.Client('http://localhost:8000');

client.subscribe('/testchannel', function (message) {
    console.log('Got a message: ' + util.inspect(message));
});