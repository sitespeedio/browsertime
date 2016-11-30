'use strict';

const ffmpegRecorder = require('../ffmpegRecorder'),
  Promise = require('bluebird'),
  path = require('path');

module.exports = {
  run(context) {
    // start(runner, testUrl, options, data, index) {
    return context.runWithDriver((driver) => {
      const storageManager = context.storageManager,
        taskData = context.taskData;

      // start on a blank page and lets make the background orange
      // that will make it easier for VisualMetrics to know when the
      // page is requested
      return driver.get('data:text/html;charset=utf-8,')
        // increase the default resource timing buffer size, in the future we
        // we should have a separate setup step.
        .then(() => driver.executeScript('window.performance.setResourceTimingBufferSize(600);'))
        .then(() => driver.executeScript('document.body.style.background = \"#DE640D\"'))
        .then(() => Promise.delay(1000))
        .then(() => storageManager.createSubDataDir('video'))
        .then((videoDir) => {
          const fileName = context.index + '.mp4',
            mpegPath = path.join(videoDir, fileName);

          taskData.videoDir = videoDir;

          let recording;

          if (process.platform === 'darwin' && !context.options.xvfb) {
            recording = ffmpegRecorder.startRecordingAVFoundation({
              display: 1,
              filePath: mpegPath
            })
          } else {
            recording = ffmpegRecorder.startRecordingX11({
              display: 99,
              size: context.options.viewPort,
              filePath: mpegPath
            })
          }

          return recording
            .then((recording) => {
              taskData.ffmpeg = recording;
            });
        })
        // The extra delay removes connections errors we sometimes get simulating 3g
        // using tc (you could see that in the diff between firstPaint and FirstVisualChange and in the video)
        .then(() => Promise.delay(1000))
        .then(() => {
          // we are ready! Make the background white and let Browsertime do the
          // work
          return driver.executeScript('document.body.style.background = \"#FFFFFF\"');
        });

    });
  }
};
