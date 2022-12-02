import { promisify } from 'node:util';
import get from 'lodash.get';
import Xvfb from '@cypress/xvfb';
import { xvfbDisplay } from '../video/defaults.js';
import { getViewPort } from '../support/getViewPort.js';
import { isAndroidConfigured } from '../android/index.js';

function buildXvfbArguments({ display, screen = 0, size, silent }) {
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
  const xvfbArguments = buildXvfbArguments({
    display: get(options, 'xvfbParams.display', xvfbDisplay),
    size: xvfbSize,
    silent: options.verbose >= 2 ? false : true
  });
  const xvfb = new Xvfb(xvfbArguments);
  const start = promisify(xvfb.start.bind(xvfb));
  await start();
  return xvfb;
}

async function stopXvfb(xvfb) {
  const stop = promisify(xvfb.stop.bind(xvfb));
  return stop();
}

/**
 * Create a new XVFB instance
 * @class
 */
export class XVFB {
  constructor(options) {
    this.options = options;
  }

  async start() {
    // This is the fix for the current use of ENV in Docker
    // we should do a better fix for that
    const useXvfb = get(this.options, 'xvfb', false);
    if (
      (useXvfb === true || useXvfb === 'true') &&
      !isAndroidConfigured(this.options)
    ) {
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
