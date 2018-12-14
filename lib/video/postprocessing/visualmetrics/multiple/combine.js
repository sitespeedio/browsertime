'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');
const path = require('path');
const convert = require('../../../screenRecording/desktop/convert');
const fileUtil = require('../../../../support/fileUtil');
const extraMetrics = require('../extraMetrics');
const SCRIPT_PATH = require('../visualMetricsPath');
const addTextToVideo = require('../../finetune/addTextToVideo');

/**
 * Combine Visual Metrics screenshots to a video and collect visiual metrics
 */
module.exports = async (
  videoDir,
  pageNumber,
  index,
  visualElementsFile,
  timingMetrics,
  options
) => {
  const tmpFile = path.join(videoDir, 'tmp-combine.mp4');
  const tmpFile2 = path.join(videoDir, 'tmp-combine2.mp4');
  const scriptArgs = [
    '--dir',
    path.join(videoDir, 'tmp', pageNumber + ''),
    '--render',
    tmpFile,
    '--json',
    '--perceptual'
  ];

  if (visualElementsFile && options.visualElements) {
    scriptArgs.push('--herodata');
    scriptArgs.push(visualElementsFile);
  }

  log.verbose('Running visualmetrics.py combine' + scriptArgs.join(' '));

  const result = await execa(SCRIPT_PATH, scriptArgs);
  const metrics = JSON.parse(result.stdout);
  const extras = extraMetrics(metrics);

  // Convert the video to a viewable format
  try {
    await convert(tmpFile, tmpFile2, 20);
    await addTextToVideo(
      tmpFile2,
      path.join(videoDir, pageNumber + '-' + index + '.mp4'),
      extras,
      timingMetrics,
      options
    );
  } catch (e) {
    log.error('Unable to convert/add text to the video', e);
  } finally {
    await fileUtil.removeFile(tmpFile);
    await fileUtil.removeFile(tmpFile2);
  }
  return extras;
};
