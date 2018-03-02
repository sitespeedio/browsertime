'use strict';

const path = require('path');
const moment = require('moment');
const get = require('lodash.get');
const util = require('../support/util');

module.exports = {
  loadPrePostScripts(scripts) {
    return util.toArray(scripts).map(script => {
      try {
        return require(path.resolve(script));
      } catch (e) {
        throw new Error(
          "Couldn't run pre/post script file: " + path.resolve(script) + ' ' + e
        );
      }
    });
  },
  calculateViewport(options) {
    const emulatedWidth = get(options, 'chrome.mobileEmulation.width');
    const emulatedHeight = get(options, 'chrome.mobileEmulation.height');
    // you cannot set the width/height for phone so just keep the viewport undefined
    if (get(options, 'chrome.android.package')) {
      return;
    }

    if (emulatedWidth && emulatedHeight) {
      return `${emulatedWidth}x${emulatedHeight}`;
    }

    if (
      /^\d+x\d+$/.test(options.viewPort) ||
      (options.viewPort === 'maximize' && !options.xvfb)
    ) {
      return options.viewPort;
    }

    return '1200x960';
  },
  timestamp() {
    return moment().format();
  }
};
