'use strict';

const path = require('path');
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
  timestamp() {
    const d = new Date();
    return d.toLocaleDateString() + '-' + d.toLocaleTimeString();
  },
  timestampUTC() {
    const d = new Date();
    return d.toUTCString();
  }
};
