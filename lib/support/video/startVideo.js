'use strict';

const ffmpegRecorder = require('./ffmpegRecorder'),
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
        .then(() => driver.executeScript('document.body.style.background = \"#DE640D\"'))
        .then(() => storageManager.createSubDataDir('video'))
        .then((dataDir) => {
          const fileName = storageManager.pathNameFromUrl(context.url) + '-' + context.index + '.mp4',
            mpegPath = path.join(dataDir, fileName);

          taskData.dataDir = dataDir;

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
        .then(() => {
          // we are ready! Make the background white and let Browsertime do the
          // work
          return driver.executeScript('document.body.style.background = \"#FFFFFF\"');
        });

    });
  }
};
