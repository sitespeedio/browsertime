'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');
const path = require('path');
const get = require('lodash.get');

const SCRIPT_PATH = require('../visualMetricsPath');

/**
 * Split multi video (that test multiple pages) into screenshots that can be used
 * to calculate visual metrics and create a video
 */
module.exports = async (videoPath, videoDir, options) => {
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

  if (get(options, 'videoParams.fullSizeVideo', false)) {
    scriptArgs.push('--full');
  }

  if (get(options, 'videoParams.videoWidth', 400) !== 400) {
    scriptArgs.push('--thumbsize');
    scriptArgs.push(get(options, 'videoParams.videoWidth'));
  }

  log.verbose('Running visualmetrics.py split' + scriptArgs.join(' '));

  try {
    await execa(SCRIPT_PATH, scriptArgs);
  } catch (e) {
    // There's an upstream bug see #
    log.error('Cannot split the video using visual metrics', e);
    throw e;
  }
};
