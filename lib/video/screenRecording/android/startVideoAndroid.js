'use strict';

const Promise = require('bluebird');
const Android = require('../../../android/');
const path = require('path');

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
          taskData.mpegPath = mpegPath;
          taskData.android = true;

          const android = new Android(context.options);
          return android
            .initConnection()
            .then(() => android.startVideo())
            .then(() => Promise.delay(1200))
            .then(() => {
              // we are ready! Make the background white and let Browsertime do the
              // work
              return driver.executeScript(
                'document.body.style.background = "#FFFFFF"'
              );
            });
        })
    );
  });
};
