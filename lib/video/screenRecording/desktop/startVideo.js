'use strict';

const ffmpegRecorder = require('./ffmpegRecorder');
const Promise = require('bluebird');
const path = require('path');
const get = require('lodash.get');
const videoDefaults = require('../../defaults');

module.exports = function start(context) {
  // start(runner, testUrl, options, data, index) {
  return context.runWithDriver(driver => {
    const storageManager = context.storageManager,
      taskData = context.taskData;

    // start on a blank page and lets make the background orange
    // that will make it easier for VisualMetrics to know when the
    // page is requested
    return (
      driver
        .get('data:text/html;charset=utf-8,')
        // increase the default resource timing buffer size, in the future we
        // we should have a separate setup step.
        .then(() =>
          driver.executeScript(
            'window.performance.setResourceTimingBufferSize(600);'
          )
        )
        // add a delay to make time for the browser to start and navigate
        .then(() => Promise.delay(1000))
        .then(() =>
          driver.executeScript('document.body.style.background = "#DE640D"')
        )
        .then(() => storageManager.createSubDataDir('video'))
        .then(videoDir => {
          const fileName = context.index + '.mp4',
            mpegPath = path.join(videoDir, fileName);

          taskData.videoDir = videoDir;

          const originFirefox = '0,71';
          const originChrome = '0,66';
          const offsetFirefox = { x: 0, y: 168 };
          const offsetChrome = { x: 0, y: 66 };

          return ffmpegRecorder
            .startRecordingX11({
              display: get(
                context,
                'options.xvfbParams.display',
                videoDefaults.xvfbDisplay
              ),
              size: context.options.viewPort,
              filePath: mpegPath,
              origin:
                context.options.browser === 'firefox'
                  ? originFirefox
                  : originChrome,
              offset:
                context.options.browser === 'firefox'
                  ? offsetFirefox
                  : offsetChrome,
              framerate: get(
                context,
                'options.videoParams.framerate',
                videoDefaults.framerate
              ),
              crf: get(context, 'options.videoParams.crf', videoDefaults.crf)
            })
            .then(recording => {
              taskData.ffmpeg = recording;
            });
        })
        // The extra delay removes connections errors we sometimes get simulating 3g
        // using tc (you could see that in the diff between firstPaint and FirstVisualChange and in the video)
        .then(() => Promise.delay(100))
        .then(() => {
          // we are ready! Make the background white and let Browsertime do the
          // work
          return driver.executeScript(
            'document.body.style.background = "#FFFFFF"'
          );
        })
    );
  });
};
