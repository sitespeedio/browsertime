'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');
const get = require('lodash.get');
const path = require('path');

const SCRIPT_PATH = require('../visualMetricsPath');

module.exports = {
  async checkDependencies() {
    return execa(SCRIPT_PATH, ['--check']);
  },
  async run(
    videoPath,
    imageDirPath,
    elementsFile,
    videoDir,
    index,
    pageNumber,
    visitedPageNumber,
    options
  ) {
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
      '--contentful',
      '--force',
      '--renderignore',
      5,
      '--json',
      '--viewport'
    ];

    // There seems to be a bug with --startwhite that makes VM bail out
    // 11:20:14.950 - Calculating image histograms
    // 11:20:14.951 - No video frames found in /private/var/folders/27/xpnvcsbs0nlfbb4qq397z3rh0000gn/T/vis-cn_JMf
    // 11:20:14.951 - Done calculating histograms
    // Since we tuned the borders of the video, I hope it will just work fine
    // without. If not, let us create a upstream issue
    // If it is the first page and no preURL we can use
    // start white, that gives us less variance in metrics in Chrome
    /*
    if (!options.preURL && visitedPageNumber === 0) {
      scriptArgs.push('--startwhite');
    }
    */

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

    if (options.verbose >= 1) {
      scriptArgs.push('--logfile');
      scriptArgs.push(path.join(videoDir, index + '.visualmetrics.log'));
      scriptArgs.push('-vvvv');
    }

    log.debug('Running visualmetrics.py ' + scriptArgs.join(' '));

    const result = await execa(SCRIPT_PATH, scriptArgs);

    log.debug('visualmetrics.py output:' + result.stdout);
    return JSON.parse(result.stdout);
  }
};
