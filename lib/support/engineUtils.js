import { resolve, dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { writeFile as _writeFile, access, unlink as _unlink } from 'node:fs';
import { pathToFileURL } from 'node:url';
import dayjs from 'dayjs';
import intel from 'intel';
import { toArray } from '../support/util.js';
const log = intel.getLogger('browsertime');
const writeFile = promisify(_writeFile);
const unlink = promisify(_unlink);

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

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
    let createdPackageJson = false;
    try {
      const packageJson = join(dirname(resolve(script)), 'package.json');
      if (await exists(packageJson)) {
        log.error(
          'Could not create package.json file, the %S file will be treated as a esmodule',
          script
        );
      } else {
        await writeFile(packageJson, '{}');
        createdPackageJson = true;
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

export async function loadScript(script, options, throwError) {
  if (script) {
    return loadFile(script, options, throwError);
  }
  return script;
}
export function timestamp() {
  return dayjs().format();
}
