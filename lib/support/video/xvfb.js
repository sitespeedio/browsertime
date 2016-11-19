'use strict';

const Xvfb = require('xvfb'),
  Promise = require('bluebird');

Promise.promisifyAll(Xvfb.prototype);

function buildXvfbArgs({display = 99, screen = 0, size}) {
  return {
    displayNum: display,
    silent: false,
    reuse: true,
    xvfb_args: ['-ac', '-nolisten', 'tcp', '-screen', screen, `${size}x24`]
  };
}

module.exports = {
  /**
   * @returns A promise for an xvfb instance. Pass it to stopXvfb.
   */
  startXvfb({display = 99, size}) {
    const xvfbArgs = buildXvfbArgs({display, size});
    const xvfb = new Xvfb(xvfbArgs);
    return xvfb.startAsync()
      .then(() => xvfb);
  },
  /**
   * @returns A promise that's resolved when xvfb has stopped.
   */
  stopXvfb(xvfb) {
    return Promise.resolve(xvfb)
      .then((x) => x.stopAsync());
  }
};
