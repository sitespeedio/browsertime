'use strict';

module.exports.BrowserError = function BrowserError(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
};

module.exports.UrlLoadError = function UrlLoadError(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
};

require('util').inherits(module.exports.BrowserError, Error);
require('util').inherits(module.exports.UrlLoadError, module.exports.BrowserError);
