'use strict';

let fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird'),
  filters = require('./filters');

Promise.promisifyAll(fs);

const rootFolder = path.resolve(__dirname, '..', '..', 'browserscripts');

function toFullPath(filename, root) {
  return path.join(root, filename);
}

function scriptsFromDirectory(dirpath) {
  return fs
    .readdirAsync(dirpath)
    .map(name => toFullPath(name, dirpath))
    .filter(filters.onlyFiles)
    .filter(filters.onlyWithExtension('.js'))
    .reduce((result, filepath) => {
      const name = path.basename(filepath, '.js');
      const script = fs.readFileAsync(filepath, 'utf8');

      return Promise.join(name, script, (n, s) => {
        result[n] = s;
        return result;
      });
    }, {});
}

function getScriptsForCategories(categories) {
  return Promise.resolve(categories)
    .then(categories =>
      fs
        .readdirAsync(rootFolder)
        .filter(name => categories.find(n => n === name))
    )
    .map(name => toFullPath(name, rootFolder))
    .filter(filters.onlyDirectories)
    .reduce((result, dirPath) => {
      const name = path.basename(dirPath);
      const scripts = scriptsFromDirectory(dirPath);

      return Promise.join(name, scripts, (n, s) => {
        result[n] = s;
        return result;
      });
    }, {});
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
function findAndParseScripts(root, category) {
  function scriptsFromDirectory(dirpath) {
    return fs
      .readdirAsync(dirpath)
      .map(name => toFullPath(name, dirpath))
      .filter(filters.onlyFiles)
      .filter(filters.onlyWithExtension('.js'))
      .reduce((result, filepath) => {
        const name = path.basename(filepath, '.js');
        const script = fs.readFileAsync(filepath, 'utf8');

        return Promise.join(name, script, (n, s) => {
          result[n] = s;
          return result;
        });
      }, {});
  }

  function parseDirectory(dirPath) {
    const categoryName = path.basename(dirPath);

    return scriptsFromDirectory(dirPath).then(scripts => {
      const categories = {};
      categories[categoryName] = scripts;
      return categories;
    });
  }

  return fs.statAsync(root).then(stat => {
    if (stat.isFile()) {
      return fs.readFileAsync(root, 'utf8').then(content => {
        const name = path.basename(root, '.js');

        let scripts = {};
        scripts[name] = content;

        let categories = {};
        categories[category] = scripts;

        return categories;
      });
    } else {
      return parseDirectory(root);
    }
  });
}

module.exports = {
  defaultScriptCategories: ['browser', 'pageinfo', 'timings'],
  get allScriptCategories() {
    return fs
      .readdirAsync(rootFolder)
      .map(fileName => path.join(rootFolder, fileName))
      .filter(filters.onlyDirectories)
      .map(dirName => path.basename(dirName));
  },
  getScriptsForCategories: getScriptsForCategories,
  findAndParseScripts: findAndParseScripts
};
