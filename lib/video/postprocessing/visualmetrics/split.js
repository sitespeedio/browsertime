'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');
const path = require('path');

const SCRIPT_PATH = require('./visualMetricsPath');

/**
 * Split multi video (that test multiple pages) into screenshots that can be used
 * to calculate visual metrics and create a video
 */
module.exports = async (videoPath, videoDir, fullSizeVideo) => {
  const scriptArgs = [
    '--video',
    videoPath,
    '--multiple',
    '--dir',
    path.join(videoDir, 'tmp'),
    '--renderignore',
    5,
    '--viewport'
  ];

  if (fullSizeVideo) {
    scriptArgs.push('--full');
  }

  log.verbose('Running visualmetrics.py split' + scriptArgs.join(' '));

  try {
    await execa(SCRIPT_PATH, scriptArgs);
  } catch (e) {
    // There's an upstream bug see #
    // log.error(e);
  }
};
