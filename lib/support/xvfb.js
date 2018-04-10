'use strict';

const Xvfb = require('xvfb');
const get = require('lodash.get');
const { promisify } = require('util');
const videoDefaults = require('../video/defaults');
const getViewPort = require('../support/getViewPort');

function buildXvfbArgs({ display, screen = 0, size, silent }) {
  return {
    displayNum: display,
    silent,
    reuse: true,
    xvfb_args: ['-ac', '-nolisten', 'tcp', '-screen', screen, `${size}x24`]
  };
}

async function startXvfb({ size, options }) {
  let xvfbSize = size;
  if (options.browser === 'firefox') {
    const extraSizeInFirefox = 200;
    const viewPort = size.split('x');
    xvfbSize = Number(viewPort[0]) + extraSizeInFirefox + 'x' + viewPort[1];
  }
  const xvfbArgs = buildXvfbArgs({
    display: get(options, 'xvfbParams.display', videoDefaults.xvfbDisplay),
    size: xvfbSize,
    silent: options.verbose >= 2 ? false : true
  });
  const xvfb = new Xvfb(xvfbArgs);
  xvfb._start = xvfb.start;
  xvfb.start = promisify(cb => xvfb._start(cb));
  xvfb._stop = xvfb.stop;
  xvfb.stop = promisify(cb => xvfb._stop(cb));
  return xvfb.start().then(() => xvfb);
}

async function stopXvfb(xvfb) {
  return Promise.resolve(xvfb).then(x => x.stop());
}

/**
 * Create a new XVFB instance
 * @class
 */
class XVFB {
  constructor(options) {
    this.options = options;
  }

  async start() {
    // This is the fix for the current use of ENV in Docker
    // we should do a better fix for that
    const useXvfb = get(this.options, 'xvfb', false);
    if (useXvfb === true || useXvfb === 'true') {
      this.xvfbSession = await startXvfb({
        size: getViewPort(this.options),
        options: this.options
      });
    }
  }

  async stop() {
    if (this.xvfbSession) {
      await stopXvfb(this.xvfbSession);
    }
  }
}

module.exports = XVFB;
