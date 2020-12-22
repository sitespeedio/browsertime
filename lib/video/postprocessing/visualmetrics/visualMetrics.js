'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');
const get = require('lodash.get');
const path = require('path');
const { readFile, removeFile } = require('../../../support/fileUtil');

const SCRIPT_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'browsertime',
  'visualmetrics.py'
);

module.exports = {
  async checkDependencies() {
    return execa(process.env.PYTHON || 'python', [SCRIPT_PATH, '--check']);
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
      '--force',
      '--renderignore',
      5,
      '--json',
      '--viewport'
    ];

    if (options.visualMetricsPerceptual) {
      scriptArgs.push('--perceptual');
    }

    if (options.visualMetricsContentful) {
      scriptArgs.push('--contentful');
    }

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

    const visualMetricsLogFile = path.join(
      videoDir,
      index + '.visualmetrics.log'
    );

    scriptArgs.push('--logfile');
    scriptArgs.push(visualMetricsLogFile);
    if (options.verbose >= 1) {
      scriptArgs.push('-vvvv');
    } else {
      // Full -vvvv is really chatty so keep this level for now.
      scriptArgs.push('-vvv');
    }

    scriptArgs.unshift(SCRIPT_PATH);

    log.debug('Running visualmetrics.py ' + scriptArgs.join(' '));

    try {
      const result = await execa(process.env.PYTHON || 'python', scriptArgs);
      log.debug('visualmetrics.py output:' + result.stdout);
      if (options.verbose < 1) {
        try {
          await removeFile(visualMetricsLogFile);
        } catch (e) {
          log.error(
            'Could not remove the log file from VisualMetrics, does it exist?: %s',
            visualMetricsLogFile
          );
        }
      }
      return JSON.parse(result.stdout);
    } catch (e) {
      log.error('VisualMetrics failed to run', e);
      // If something goes wrong, dump the visual metrics log to our log
      const visualMetricLog = await readFile(visualMetricsLogFile);
      log.error('Log from VisualMetrics: %s', visualMetricLog);
      throw e;
    }
  }
};
