'use strict';

class BrowsertimeError extends Error {
  constructor(message, extra) {
    super(message);
    this.extra = extra || {};
    this.name = this.constructor.name;
  }
}

class BrowserError extends BrowsertimeError {
  constructor(message, extra) {
    super(message, extra);
  }
}

class UrlLoadError extends BrowsertimeError {
  constructor(message, url, extra) {
    super(message, extra);
    this.url = url;
  }
}

module.exports = {
  BrowsertimeError,
  BrowserError,
  UrlLoadError
};
