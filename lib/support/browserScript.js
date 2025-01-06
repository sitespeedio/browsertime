import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { getLogger } from '@sitespeed.io/log';
import { onlyFiles, onlyWithExtension, onlyDirectories } from './filters.js';
const require = createRequire(import.meta.url);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFolder = path.resolve(__dirname, '..', '..', 'browserscripts');
const log = getLogger('browsertime');

function toFullPath(filename, root) {
  return path.join(root, filename);
}

/**
 * Read all JavaScript files in a specific dir. Will use the filename
 * without .js as the name of the script.
 * @param {*} dirpath
 */
async function scriptsFromDirectory(dirpath) {
  const dir = await readdir(dirpath);

  const cleaned = dir
    .map(name => toFullPath(name, dirpath))
    .filter(await onlyFiles)
    .filter(onlyWithExtension('.js'));
  const result = {};
  for (const filepath of cleaned) {
    const name = path.basename(filepath, '.js');
    const script = await readFile(filepath, 'utf8');
    result[name] = generateScriptObject(name, filepath, script);
  }
  return result;
}

async function getScriptsForCategories(categories) {
  const directories = await readdir(rootFolder);
  const cleaned = directories
    .filter(name => categories.find(n => n === name))
    .map(name => toFullPath(name, rootFolder))
    .filter(await onlyDirectories);
  const result = {};
  for (const dir of cleaned) {
    const name = path.basename(dir);
    const scripts = await scriptsFromDirectory(dir);
    result[name] = scripts;
  }
  return result;
}

/**
 * Take the name of a script, its location on the disk and its contents and
 * generate a script object:
 *
 * name: The name of the script.
 * function: A function object if this is a new-style script; null otherwise.
 * content: The source code of the function (contents) if this is a old-style
 *          script; null otherwise.
 * requires: An object with boolean fields indictating which requirements
 *           must be met to execute this new-style function; the object is empty
 *           for an old-style function.
 *
 * @param {string}
 * @param {string}
 * @param {string}
 * @returns {ScriptObject}
 */
function generateScriptObject(name, path, contents) {
  try {
    const scriptAndMetadataObject = require(path);

    if (
      typeof scriptAndMetadataObject.function === 'function' &&
      typeof scriptAndMetadataObject.requires === 'object'
    ) {
      log.verbose(name + ' is a new-style script object.');
      return {
        name: name,
        requires: scriptAndMetadataObject.requires,
        function: scriptAndMetadataObject.function,
        content: undefined,
        isAsync:
          Object.getPrototypeOf(scriptAndMetadataObject.function) ===
          Object.getPrototypeOf(async function () {})
      };
    }
  } catch {
    // Use this as a signal to fall back to an old-style script, but don't
    // perform any action
  }
  log.verbose(name + ' is an old-style script object.');

  return {
    name: name,
    content: contents,
    function: undefined,
    requires: {}
  };
}

/**
 * Parse a file or directory, and return an object representing that groups scripts by category.
 * Single js files will be put into the category 'custom', for directories the category name will
 * be taken from the directory name.
 *
 * The resulting value looks like this:
 * <pre>
 * {
 *   'category': {
 *    'script': <contents of script.js>
 *   }
 * }
 * </pre>
 * @param {string} root a path to a js file, alternatively a directory containing js files.
 * @param {string} category a category to apply if a file is passed
 * @returns {Promise.<Object>}
 */
async function findAndParseScripts(root, category) {
  async function scriptsFromDirectory(dirpath) {
    const dir = await readdir(dirpath);
    const cleaned = dir
      .map(name => toFullPath(name, dirpath))
      .filter(await onlyFiles)
      .filter(onlyWithExtension('.js'));
    const result = {};
    for (const filepath of cleaned) {
      const name = path.basename(filepath, '.js');
      const script = await readFile(filepath, 'utf8');

      result[name] = generateScriptObject(name, root, script);
    }
    return result;
  }

  async function parseDirectory(dirPath) {
    const categoryName = path.basename(dirPath);

    return scriptsFromDirectory(dirPath).then(scripts => {
      const categories = {};
      categories[categoryName] = scripts;
      return categories;
    });
  }

  return stat(root).then(stats => {
    return stats.isFile()
      ? readFile(root, 'utf8').then(content => {
          const name = path.basename(root, '.js');
          let scripts = {};

          scripts[name] = generateScriptObject(name, root, content);
          let categories = {};
          categories[category] = scripts;

          return categories;
        })
      : parseDirectory(root);
  });
}

const defaultScriptCategories = ['browser', 'pageinfo', 'timings'];

// FIXME need to add async here, is that possible for properties?
async function allScriptCategories() {
  return readdir(rootFolder).then(files => {
    files = files.map(fileName => path.join(rootFolder, fileName));
    const p = [];
    for (const file of files) {
      p.push(onlyDirectories(file));
    }
    return Promise.all(p).then(isDirectories => {
      const onlyDirectories = [];
      for (const [index, isDirectory] of isDirectories.entries()) {
        if (isDirectory) {
          onlyDirectories.push(files[index]);
        }
      }
      return onlyDirectories.map(dirName => path.basename(dirName));
    });
  });
}

export {
  defaultScriptCategories,
  allScriptCategories,
  getScriptsForCategories,
  findAndParseScripts
};
