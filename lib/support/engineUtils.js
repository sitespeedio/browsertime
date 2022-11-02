import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import dayjs from 'dayjs';
import intel from 'intel';
import { toArray } from '../support/util.js';
const require = createRequire(import.meta.url);
const log = intel.getLogger('browsertime');

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;


export function loadPrePostScripts(scripts) {
  return toArray(scripts).map(script => {
    // if the script is an AsyncFunction, return it.
    if (script instanceof AsyncFunction) {
      return script;
    }
    try {
        return require(resolve(script));
      }
    catch (error) {
      throw new Error(
        "Couldn't run pre/post script file: " + resolve(script) + ' ' + error
      );
    }
  });
}

export function loadScript(script, throwError) {
  if (script) {
    // if the script is an AsyncFunction, return it.
    if (script instanceof AsyncFunction) {
      return script;
    } else if (!script.endsWith('js')) {
      // This is an inline script 
      return script;
    }
    try {
     
        return require(resolve(script));
      } catch (error) {
      // assume the script is a valid inline script by default
      if (throwError) {
        log.error(
          'Could not parse user script %s with error %s',
          script,
          error
        );
        throw error;
      }
    }
  }
  return script;
}
export function timestamp() {
  return dayjs().format();
}
