'use strict';

var log4js = require('log4js');

/* // You may load then append log4js-fayeAppender
log4js.loadAppender('log4js-fayeAppender');
log4js.addAppender(log4js.appenders['log4js-fayeAppender']('http://localhost:8000', '/testchannel'));
*/
// Or simply pass a typical configuration
log4js.configure({
    appenders: [
        {type: 'log4js-fayeAppender', url: 'http://localhost:8000', channel: '/testchannel'},
        {type: 'console'}
    ]
});

var logger = log4js.getLogger('someCategory');

logger.info('Note that the first log is delayed due to faye needing some time to connect to the server');

logger.fatal('fatal is magenta');
logger.error('error is red');
logger.warn('warn is yellow');
logger.info('info is green');
logger.debug('debug is cyan');
logger.trace('trace is blue');

log4js.shutdown(function (err) {
    if (err) {
        console.error(err);
    }
});