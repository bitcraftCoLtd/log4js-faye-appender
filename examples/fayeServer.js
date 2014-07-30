/**
 * A simple faye server that will aggregate logs
 * and handle client subscriptions
 */

var http = require('http');
var faye = require('faye');

var server = http.createServer(),
    bayeux = new faye.NodeAdapter({mount: '/'});

bayeux.attach(server);
server.listen(8000);