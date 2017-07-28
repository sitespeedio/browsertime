'use strict';

const ChromeDelegate = require('./chromeDelegate'),
  FirefoxDelegate = require('./firefoxDelegate'),
  nullDelegate = require('./nullDelegate');

module.exports = {
  createDelegate(options) {
    if (options.browser === 'firefox') return new FirefoxDelegate(options);
    if (options.browser === 'chrome') return new ChromeDelegate(options);

    return nullDelegate;
  }
};
