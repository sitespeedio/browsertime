'use strict';

const path = require('path');
const dayjs = require('dayjs');
const util = require('../support/util');
const log = require('intel').getLogger('browsertime');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

module.exports = {
  loadPrePostScripts(scripts) {
    return util.toArray(scripts).map(script => {
      // if the script is an AsyncFunction, return it.
      if (script instanceof AsyncFunction) {
        return script;
      }
      try {
        return require(path.resolve(script));
      } catch (e) {
        throw new Error(
          "Couldn't run pre/post script file: " + path.resolve(script) + ' ' + e
        );
      }
    });
  },
  loadScript(script, throwError) {
    if (script) {
      // if the script is an AsyncFunction, return it.
      if (script instanceof AsyncFunction) {
        return script;
      }
      try {
        return require(path.resolve(script));
      } catch (e) {
        // assume the script is a valid inline script by default
        if (throwError) {
          log.error('Could not parse user script %s with error %s', script, e);
          throw e;
        }
      }
    }
    return script;
  },
  timestamp() {
    return dayjs().format();
  }
};
