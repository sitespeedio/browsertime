'use strict';

let Promise = require('bluebird');

const delegate = {};
delegate.onStart = delegate.onStartRun = delegate.onStartIteration = delegate.onStopIteration = delegate.onStopRun =
  delegate.onStop = Promise.resolve;

module.exports = delegate;
