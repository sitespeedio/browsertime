'use strict';

const path = require('path');
const forEach = require('lodash.foreach');
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

  jsonifyVisualProgress(visualProgress) {
    // Original data looks like
    //  "0=0%, 1500=81%, 1516=81%, 1533=84%, 1550=84%, 1566=84%, 1600=95%, 1683=95%, 1833=100%"
    const progress = visualProgress.split(',');
    const visualProgressJSON = {};
    forEach(progress, value => {
      const eachMetric = value.split('=');
      visualProgressJSON[eachMetric[0].replace(' ', '')] = Number(
        eachMetric[1].replace('%', '')
      );
    });
    return visualProgressJSON;
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
