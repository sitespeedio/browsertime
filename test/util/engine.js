const Engine = require('../../lib/core/engine');
const merge = require('lodash.merge');

module.exports = {
  getEngine(options) {
    const defaultOptions = {
      browser: process.env.BROWSER || 'chrome',
      timeouts: {
        browserStart: 60000,
        scripts: 5000,
        pageLoad: 10000,
        pageCompleteCheck: 5000
      },
      iterations: 1,
      pageLoadStrategy: 'normal',
      pageCompleteWaitTime: 10
    };
    const o = merge({}, defaultOptions, options);
    return new Engine(o);
  }
};
