'use strict';

const path = require('path');
const dayjs = require('dayjs');
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
  loadScript(script) {
    if (script) {
      try {
        return require(path.resolve(script));
      } catch (e) {
        // assume the script is a valid inline script
      }
    }
    return script;
  },
  timestamp() {
    return dayjs().format();
  }
};
