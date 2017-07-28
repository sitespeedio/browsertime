'use strict';

const Engine = require('./lib/core/engine'),
  SeleniumRunner = require('./lib/core/seleniumRunner'),
  errors = require('./lib/support/errors'),
  browserScripts = require('./lib/support/browserScript'),
  logging = require('./lib/support/logging');

module.exports = {
  Engine,
  SeleniumRunner,
  errors,
  logging,
  browserScripts
};
