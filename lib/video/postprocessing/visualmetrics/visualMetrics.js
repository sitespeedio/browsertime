'use strict';

const execa = require('execa');
const log = require('intel');
const get = require('lodash.get');
const path = require('path');
const { isAndroidConfigured } = require('../../../android');

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
  async run(videoPath, imageDirPath, options) {
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
      '--startwhite',
      '--renderignore',
      5,
      '--json'
    ];

    if (isAndroidConfigured(options)) {
      scriptArgs.push('--viewport');
    }

    if (createFilmstrip) {
      scriptArgs.push('-q');
      scriptArgs.push(filmstripQuality);
      scriptArgs.unshift('--dir', imageDirPath);
      if (fullSizeFilmstrip) {
        scriptArgs.push('--full');
      }
    }

    log.verbose('Running visualmetrics.py ' + scriptArgs.join(' '));

    const result = await execa(SCRIPT_PATH, scriptArgs);
    return JSON.parse(result.stdout);
  }
};
