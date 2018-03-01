'use strict';

const Promise = require('bluebird');
const get = require('lodash.get');
const convert = require('./convertToFps');
const videoDefaults = require('../../defaults');
const Android = require('../../../android/');

module.exports = function stop(context) {
  const taskData = context.taskData;
  const options = taskData.options;
  const videoWait = get(options, 'videoParams.androidVideoWaitTime', 5000);

  context.log.debug('Stop screen recording');
  const framerate = get(
    options,
    'videoParams.framerate',
    videoDefaults.framerate
  );

  const android = new Android(context.options);
  taskData.videoPaths = taskData.videoPaths || {};
  taskData.videoPaths['' + context.index] = taskData.mpegPath;
  return (
    android
      .initConnection()
      .then(() => android.stopVideo())
      // give the phone the time needed to process the video
      .then(() => Promise.delay(videoWait))
      .then(() =>
        android
          .pullVideo(taskData.mpegPath)
          .then(() => convert(taskData.mpegPath, framerate))
      )
  );
};
