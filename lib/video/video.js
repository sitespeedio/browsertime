'use strict';

const get = require('lodash.get');
const getRecorder = require('./screenRecording/recorder');
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
    this.recorder = getRecorder(get(options, 'chrome.android.package', false));
  }

  /**
   * Start recoding a video.
   * @param {object} context - a pre/post task configuration object
   * @returns {Promise} Promise object that represents when the video started
   */
  record(context) {
    return this.recorder.start(context);
  }

  /**
   * Stop recording the video.
   * @param {object} context - a pre/post task configuration object
   * @returns {Promise} Promise object that represents when the video stopped
   */
  stop(context) {
    return this.recorder.stop(context);
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
