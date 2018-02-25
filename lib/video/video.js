'use strict';
const get = require('lodash.get');
const startVideoDesktop = require('./screenRecording/desktop/startVideo');
const startVideoAndroid = require('./screenRecording/android/startVideoAndroid');
const stopVideoDesktop = require('./screenRecording/desktop/stopVideo');
const stopVideoAndroid = require('./screenRecording/android/stopVideoAndroid');
const runVisualMetrics = require('./postprocessing/visualmetrics/runVisualMetrics');
const removeVideo = require('./postprocessing/removeVideo');
const finetuneVideo = require('./postprocessing/finetune/finetuneVideo');

/**
 * Create a new Video that handles everything with the video
 * @class
 */
class Video {
  constructor(options) {
    this.options = options;
    this.testOnAndroid = get(options, 'chrome.android.package', false);
  }

  /**
   * Start recoding a video.
   * @param {object} context - a pre/post task configuration object
   * @returns {Promise} Promise object that represents when the video started
   */
  record(context) {
    return this.testOnAndroid
      ? startVideoAndroid.run(context)
      : startVideoDesktop.run(context);
  }

  /**
   * Stop recording the video.
   * @param {object} context - a pre/post task configuration object
   * @returns {Promise} Promise object that represents when the video stopped
   */
  stop(context) {
    return this.testOnAndroid
      ? stopVideoAndroid.run(context)
      : stopVideoDesktop.run(context);
  }
  /**
   * Get an array of operations that will post process the video.
   * Post process can be run visual metrics, finetune the final video
   * and/or just remove the video.
   * @returns {Array} An array of operations that can be run to post processing the video
   */
  postProcessingOperations() {
    const operations = [];
    if (this.options.speedIndex) {
      operations.push(runVisualMetrics);
    }

    if (this.options.video) {
      operations.push(finetuneVideo);
    } else {
      operations.push(removeVideo);
    }
    return operations;
  }
}

module.exports = Video;
