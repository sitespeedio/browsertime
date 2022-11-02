import { resolve, join, sep } from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import dayjs from 'dayjs';
import intel from 'intel';
import { toArray } from '../support/util.js';
import { copyFile, copyFileSync } from './fileUtil.js';
import { realpathSync, mkdtempSync, rmdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const log = intel.getLogger('browsertime');

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function getTmp() {
  return mkdtempSync(realpathSync(os.tmpdir()) + sep);
}

export function loadPrePostScriptsSync(scripts) {
  return toArray(scripts).map(script => {
    // if the script is an AsyncFunction, return it.
    if (script instanceof AsyncFunction) {
      return script;
    }
    try {
      if (script.endsWith('.js')) {
        const dir = getTmp();
        const name = join(dir, 'tmp.cjs');
        copyFileSync(script, name);
        const data = require(resolve(name));
        rmdirSync(dir, { recursive: true });
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
      const dir = getTmp();
      const name = join(dir, 'tmp.cjs');
      copyFileSync(script, name);
      const data = require(resolve(name));
      rmdirSync(dir, { recursive: true });
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
        const dir = getTmp();
        const name = join(dir, 'tmp.cjs');
        await copyFile(script, name);
        const data = require(resolve(name));
        rmdirSync(dir, { recursive: true });
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
