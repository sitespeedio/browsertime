'use strict';

const Promise = require('bluebird');

const delegate = {};
delegate.onStartRun = delegate.onStartIteration = delegate.onStopIteration = delegate.onStopRun =
  Promise.resolve;

module.exports = delegate;
