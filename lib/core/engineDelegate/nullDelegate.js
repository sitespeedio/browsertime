'use strict';

const delegate = {};
delegate.onStartRun = delegate.onStartIteration = delegate.onStopIteration = delegate.onStopRun = async () => {};

module.exports = delegate;
