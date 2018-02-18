'use strict';

const xvfb = require('../../support/video/xvfb');
const get = require('lodash.get');

/**
 * Create a new XVFB instance
 * @class
 */
class XVFB {
  constructor(options) {
    this.options = options;
  }

  start() {
    // This is the fix for the current use of ENV in Docker
    // we should do a better fix for that
    const useXvfb = get(this.options, 'xvfb', false);
    if (useXvfb === true || useXvfb === 'true') {
      return xvfb
        .startXvfb({ size: this.options.viewPort, options: this.options })
        .tap(xvfbSession => {
          this.xvfbSession = xvfbSession;
        });
    } else return Promise.resolve();
  }

  stop() {
    if (this.xvfbSession) {
      return xvfb.stopXvfb(this.xvfbSession);
    } else return Promise.resolve();
  }
}

module.exports = XVFB;
