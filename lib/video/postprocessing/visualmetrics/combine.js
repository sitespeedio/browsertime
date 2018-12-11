'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');
const path = require('path');
const convert = require('../../screenRecording/desktop/convert');
const fileUtil = require('../../../support/fileUtil');
const SCRIPT_PATH = require('./visualMetricsPath');

/**
 * Combine Visual Metrics screenshots to a video and collect visiual metrics
 */
module.exports = async (videoDir, pageNumber, index) => {
  const tmpFile = path.join(videoDir, 'tmp-combine.mp4');
  const scriptArgs = [
    '--dir',
    path.join(videoDir, 'tmp', pageNumber + ''),
    '--render',
    tmpFile,
    '--json',
    '--perceptual'
  ];

  log.verbose('Running visualmetrics.py combine' + scriptArgs.join(' '));

  const result = await execa(SCRIPT_PATH, scriptArgs);
  // Convert the video to a viewable format
  await convert(
    tmpFile,
    path.join(videoDir, pageNumber + '-' + index + '.mp4'),
    20
  );
  await fileUtil.removeFile(tmpFile);
  return JSON.parse(result.stdout);
};
