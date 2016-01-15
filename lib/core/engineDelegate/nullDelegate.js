'use strict';

let Promise = require('bluebird');

const delegate = {};
delegate.onStart = delegate.onStartRun = delegate.onStartPage = delegate.onStopRun = delegate.onStop = Promise.resolve;

module.exports = delegate;
