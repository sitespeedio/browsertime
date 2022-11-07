import { resolve, dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { writeFile as _writeFile, access, unlink as _unlink } from 'node:fs';
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

export async function loadPrePostScripts(scripts) {
  const readScripts = [];
  for (let script of toArray(scripts)) {
    if (script instanceof AsyncFunction) {
      readScripts.push(script);
    } else {
      try {
        const myFunction = await import(resolve(script));
        readScripts.push(myFunction.default ?? myFunction);
      } catch (error) {
        throw new Error(
          "Couldn't run pre/post script file: " + resolve(script) + ' ' + error
        );
      }
    }
  }
  return readScripts;
}

export async function loadScript(script, options, throwError) {
  if (script) {
    // if the script is an AsyncFunction, return it.
    if (script instanceof AsyncFunction) {
      return script;
    } else if (!script.endsWith('js')) {
      // This is an inline script
      return script;
    }
    // If we follow correct naming for modules (.mjs) or commonjs (.cjs)
    // we just loads it. .js files is loaded as commonjs for now
    if (
      options.cjs === false ||
      script.endsWith('.mjs') ||
      script.endsWith('.cjs')
    ) {
      let myFunction = await import(resolve(script));
      return myFunction.default ?? myFunction;
    } else {
      // Hack a way! Try to add a package.json file in the same folder as the
      // script file. That way, the .js file will be treated as commonjs =
      // working as before we moved Browsertime to module
      let createdPackageJson = false;
      try {
        const packageJson = join(dirname(resolve(script)), 'package.json');
        if (!(await exists(packageJson))) {
          await writeFile(packageJson, '{}');
          createdPackageJson = true;
        } else {
          log.error(
            'Could not create package.json file, the %S file will be treated as a module',
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
  return script;
}
export function timestamp() {
  return dayjs().format();
}
