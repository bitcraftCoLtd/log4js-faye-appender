'use strict';
/*global Faye: true, document: true*/
var client = new Faye.Client('http://localhost:8000');
var containerDiv = document.getElementById('containerDiv');

function zeroPadding(number, len) {
    if (!len && len !== 0) {
        len = 2;
    }
    var str = String(number);
    while (str.length < len) {
        str = '0' + str;
    }
    return str;
}

// 2014-04-03 12:56:00.805
function formatDate(dateStr) {
    var date = new Date(dateStr);
    return date.getFullYear() + '-' +
        zeroPadding(date.getMonth() + 1) + '-' +
        zeroPadding(date.getDate()) + ' ' +
        date.getHours() + ':' +
        zeroPadding(date.getMinutes()) + ':' +
        zeroPadding(date.getSeconds()) + '.' +
        zeroPadding(date.getMilliseconds(), 3);
}

function localLog(str) {
    var newSpan = document.createElement('p');
    newSpan.innerHTML = '<span style="color:grey">' +
        '[' + formatDate(new Date()) +
        ']  - ' + '</span>' + str;
    return newSpan;
}

client.on('transport:up', function () {
    containerDiv.appendChild(localLog('Connected to log server'));
    document.body.scrollTop = containerDiv.scrollHeight;
});

client.on('transport:down', function () {
    containerDiv.appendChild(localLog('Disconnected from log server'));
    document.body.scrollTop = containerDiv.scrollHeight;
});

var colors = {
    ALL: 'grey',
    TRACE: 'blue',
    DEBUG: '#00C0C0', //'cyan',
    INFO: 'green',
    WARN: '#D3A900', //'yellow',
    ERROR: 'red',
    FATAL: 'magenta',
    OFF: 'grey'
};

function logLevelToColor(level) {
    return colors[level.levelStr] || 'grey';
}

function formatLog(loggingEvent) {
    var i,
        result = '<span style="color:' + logLevelToColor(loggingEvent.level) + '">' +
            '[' + formatDate(loggingEvent.startTime) +
            '] [' + loggingEvent.level.levelStr +
            '] ' + loggingEvent.categoryName +
            ' - ' + '</span>' + loggingEvent.data[0];
    if (loggingEvent.data && loggingEvent.data.length > 1) {
        for (i = 1; i < loggingEvent.data.length; i += 1) {
            result += '<br>' + loggingEvent.data[i];
        }
    }
    return result;
}

function messageToSpan(message) {
    var newSpan = document.createElement('p');
    newSpan.innerHTML = formatLog(message);
    return newSpan;
}

client.subscribe('/testchannel', function (message) {
    containerDiv.appendChild(messageToSpan(message));
    document.body.scrollTop = containerDiv.scrollHeight;
});

client.disable('autodisconnect');