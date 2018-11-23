'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');
const get = require('lodash.get');
const path = require('path');

const SCRIPT_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'vendor',
  'visualmetrics.py'
);

module.exports = {
  async checkDependencies() {
    return execa(SCRIPT_PATH, ['--check']);
  },
  async run(videoPath, imageDirPath, elementsFile, videoDir, index, options) {
    const filmstripQuality = get(options, 'videoParams.filmstripQuality', 75);
    const createFilmstrip = get(options, 'videoParams.createFilmstrip', true);
    const fullSizeFilmstrip = get(
      options,
      'videoParams.filmstripFullSize',
      false
    );

    const scriptArgs = [
      '--video',
      videoPath,
      '--orange',
      '--perceptual',
      '--force',
      '--renderignore',
      5,
      '--json',
      '--viewport'
    ];

    // If we know that we don't run a prescript/preURL we can use
    // start white, that gives us less variance in metrics in Chrome
    if (!options.preURL && !options.preScript && !options.scriptNavigation) {
      scriptArgs.push('--startwhite');
    }

    if (options.visualElements) {
      scriptArgs.push('--herodata');
      scriptArgs.push(elementsFile);
    }

    if (createFilmstrip) {
      scriptArgs.push('-q');
      scriptArgs.push(filmstripQuality);
      scriptArgs.unshift('--dir', imageDirPath);
      if (fullSizeFilmstrip) {
        scriptArgs.push('--full');
      }
    }

    if (options.verbose >= 3) {
      scriptArgs.push('--logfile');
      scriptArgs.push(path.join(videoDir, index + '.visualmetrics.log'));
      scriptArgs.push('-vvvv');
    }

    log.verbose('Running visualmetrics.py ' + scriptArgs.join(' '));

    const result = await execa(SCRIPT_PATH, scriptArgs);
    return JSON.parse(result.stdout);
  }
};
