'use strict';

const Xvfb = require('xvfb'),
  Promise = require('bluebird');

Promise.promisifyAll(Xvfb.prototype);

function buildXvfbArgs({ display = 99, screen = 0, size, silent }) {
  return {
    displayNum: display,
    silent,
    reuse: true,
    xvfb_args: ['-ac', '-nolisten', 'tcp', '-screen', screen, `${size}x24`]
  };
}

module.exports = {
  /**
   * @returns A promise for an xvfb instance. Pass it to stopXvfb.
   */
  startXvfb({ display = 99, size, options }) {
    let xvfbSize = size;
    if (options.browser === 'firefox') {
      const extraSizeInFirefox = 200;
      const viewPort = size.split('x');
      xvfbSize = Number(viewPort[0]) + extraSizeInFirefox + 'x' + viewPort[1];
    }
    const xvfbArgs = buildXvfbArgs({
      display,
      size: xvfbSize,
      silent: options.verbose >= 2 ? false : true
    });
    const xvfb = new Xvfb(xvfbArgs);
    return xvfb.startAsync().then(() => xvfb);
  },
  /**
   * @returns A promise that's resolved when xvfb has stopped.
   */
  stopXvfb(xvfb) {
    return Promise.resolve(xvfb).then(x => x.stopAsync());
  }
};
