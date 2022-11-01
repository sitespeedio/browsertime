import { resolve, join, sep } from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import dayjs from 'dayjs';
import intel from 'intel';
import { toArray } from '../support/util.js';
import {
  removeFile,
  copyFile,
  removeFileSync,
  copyFileSync
} from './fileUtil.js';
import { realpathSync, mkdtempSync } from 'node:fs';
const require = createRequire(import.meta.url);
const log = intel.getLogger('browsertime');

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function getTmp(name) {
  const dir = mkdtempSync(realpathSync(os.tmpdir()) + sep);
  return join(dir, name);
}

export function loadPrePostScriptsSync(scripts) {
  return toArray(scripts).map(script => {
    // if the script is an AsyncFunction, return it.
    if (script instanceof AsyncFunction) {
      return script;
    }
    try {
      if (script.endsWith('.js')) {
        const name = getTmp('tmp.cjs');
        copyFileSync(script, name);
        const data = require(resolve(name));
        removeFileSync(name);
        return data;
      } else {
        return require(resolve(script));
      }
    } catch (error) {
      throw new Error(
        "Couldn't run pre/post script file: " + resolve(script) + ' ' + error
      );
    }
  });
}

export function loadScriptSync(script) {
  if (script instanceof AsyncFunction) {
    return script;
  }
  try {
    if (script.endsWith('.js')) {
      const name = getTmp('tmp.cjs');
      copyFileSync(script, name);
      const data = require(resolve(name));
      removeFileSync(name);
      return data;
    } else {
      return require(resolve(script));
    }
  } catch {
    // assume the script is a valid inline script by default
    return script;
  }
}

export async function loadScript(script, throwError) {
  if (script) {
    // if the script is an AsyncFunction, return it.
    if (script instanceof AsyncFunction) {
      return script;
    }
    try {
      if (script.endsWith('.js')) {
        const name = getTmp('tmp.cjs');
        await copyFile(script, name);
        const data = require(resolve(name));
        await removeFile(name);
        return data;
      } else {
        return require(resolve(script));
      }
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
