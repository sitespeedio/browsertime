import { resolve, dirname, join } from 'node:path';
import { promisify } from 'node:util';
import {
  writeFile as _writeFile,
  unlink as _unlink,
  readFile as _readFile
} from 'node:fs';
import { pathToFileURL } from 'node:url';
import dayjs from 'dayjs';
import intel from 'intel';
import { toArray } from '../support/util.js';
const log = intel.getLogger('browsertime');
const writeFile = promisify(_writeFile);
const readFile = promisify(_readFile);
const unlink = promisify(_unlink);

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

async function loadFile(script, options, throwError) {
  // if the script is an AsyncFunction, return it.
  if (script instanceof AsyncFunction) {
    return script;
  } else if (!script.endsWith('js')) {
    // This is an inline script
    return script;
  }
  // If we follow correct naming for modules (.mjs) or commonjs (.cjs)
  // we just loads it. .js files is loaded as commonjs if you set
  // --cjs true
  if (
    options.cjs === false ||
    script.endsWith('.mjs') ||
    script.endsWith('.cjs')
  ) {
    let myFunction = await import(pathToFileURL(resolve(script)));
    return myFunction.default ?? myFunction;
  } else {
    // Hack a way! Try to add a package.json file in the same folder as the
    // script file. That way, the .js file will be treated as commonjs =
    // working as before we moved Browsertime to module
    log.info(
      'Will try to load load JS as a commonjs file by adding an emtpy package.json'
    );
    let createdPackageJson = false;
    try {
      const packageJson = join(dirname(resolve(script)), 'package.json');
      try {
        await writeFile(packageJson, '{}');
        createdPackageJson = true;
      } catch {
        log.error(
          'Could not create package.json file, the %s file will be treated as a esmodule',
          script
        );
      }
      const myFunction = await import(resolve(script));

      try {
        if (createdPackageJson) {
          await unlink(packageJson);
        }
      } catch (error) {
        log.error(error);
      }

      return myFunction.default ?? myFunction;
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
}

export async function loadPrePostScripts(scripts, options) {
  const readScripts = [];
  for (let script of toArray(scripts)) {
    const loadedScript = await loadFile(script, options, true);
    readScripts.push(loadedScript);
  }
  return readScripts;
}

export async function loadPageCompleteScript(script) {
  if (script && script.endsWith('js')) {
    return readFile(resolve(script), 'utf8');
  }
  return script;
}

export async function loadScript(script, options, throwError) {
  if (script) {
    return loadFile(script, options, throwError);
  }
  return script;
}
export function timestamp() {
  return dayjs().format();
}
