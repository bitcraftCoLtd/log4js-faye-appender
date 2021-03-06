'use strict';

var FayeClient = require('faye').Client;
var async = require('async');

/**
 * @typedef {(Faye.Client|Faye.Deferrable|Faye.Publisher|Faye.Logging|Faye.Extensible)} FayeClientBase
 */

/**
 * @typedef {FayeClientBase} FayeClient
 * @property {number} ongoingPublicationCount
 * @property {function} waitingToBeDone
 */

/**
 * @typedef {Object} fayeAppenderConfig
 * @property {string} url
 * @property {string} channel
 */

/** @type {Object.<string,FayeClient>} */
var clients = {};

/**
 * @param {FayeClient} localClient
 * @returns {function()}
 */
function callbackFactory(localClient) {
    return function () {
        localClient.ongoingPublicationCount -= 1;
        if (localClient.ongoingPublicationCount === 0 && localClient.waitingToBeDone) {
            localClient.waitingToBeDone();
        }
    };
}

/**
 * @param {FayeClient} localClient
 * @param {string} channel
 * @returns {Function}
 */
function eventLoggerFactory(localClient, channel) {
    /** @type {function()} */
    var localCallback = callbackFactory(localClient);
    return function (loggingEvent) {
        var publication;
        if (loggingEvent) {
            localClient.ongoingPublicationCount += 1;
            publication = localClient.publish(channel, loggingEvent);
            publication.callback(localCallback);
        }
    };
}

/**
 * @param {string} url - e.g. 'http://localhost:8000'
 * @param {string} channel - e.g. '/testChannel'
 * @returns {Function}
 */
function fayeAppender(url, channel) {
    var disconnected = false;
    /** @type {FayeClient} */
    var localClient;
    // we keep track of clients in a map
    // in order to re-use pre-existing connections
    // while allowing multiple configuration of this
    // appender
    if (!clients[url]) {
        localClient = new FayeClient(url);
        clients[url] = localClient;
        localClient.ongoingPublicationCount = 0;
        localClient.bind('transport:down', function () {
            if (!disconnected) {
                disconnected = true;
                console.log('[faye connection down (url: ' + url + ')]');
            }
        });
        localClient.bind('transport:up', function () {
            if (disconnected) {
                console.log('[faye connection up (' + url + ')]');
            }
        });
    } else {
        localClient = clients[url];
    }
    return eventLoggerFactory(localClient, channel);
}

/**
 * @param {fayeAppenderConfig} config
 * @returns {Function}
 */
function configure(config) {
    return fayeAppender(config.url, config.channel);
}

function shutDownClient(client, callback) {
    client.unbind('transport:down');
    client.unbind('transport:up');
    // disconnection must wait for completion of ongoing publications
    if (client.ongoingPublicationCount === 0) {
        client.disconnect();
        callback();
        return;
    }
    // maybe add a setTimeout in case the callback never makes it
    client.waitingToBeDone = function () {
        client.disconnect();
        callback();
    };
}

function shutdown(cb) {
    var i;
    var clientsArray = [];
    for (i in clients) {
        if (clients.hasOwnProperty(i)) {
            clientsArray.push(clients[i]);
        }
    }
    console.log('Shutting down');
    async.map(
        clientsArray,
        shutDownClient,
        cb
    );
}

exports.appender = fayeAppender;
exports.configure = configure;
exports.shutdown = shutdown;