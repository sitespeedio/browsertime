import Engine from '../../lib/core/engine/index.js';
import merge from 'lodash.merge';

export function getEngine(options) {
  const defaultOptions = {
    browser: process.env.BROWSER || 'chrome',
    timeouts: {
      browserStart: 60_000,
      scripts: 5000,
      pageLoad: 10_000,
      pageCompleteCheck: 5000
    },
    iterations: 1,
    pageLoadStrategy: 'normal',
    pageCompleteWaitTime: 10,
    headless: true
  };
  const o = merge({}, defaultOptions, options);
  return new Engine(o);
}
