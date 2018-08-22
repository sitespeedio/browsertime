'use strict';
const path = require('path');
const getRecorder = require('./screenRecording/recorder');
const runVisualMetrics = require('./postprocessing/visualmetrics/runVisualMetrics');
const removeVideo = require('./postprocessing/removeVideo');
const finetuneVideo = require('./postprocessing/finetune/finetuneVideo');

/**
 * Create a new Video that handles everything with the video
 * @class
 */
class Video {
  constructor(storageManager, options) {
    this.options = options;
    this.storageManager = storageManager;
    this.recorder = getRecorder(options);
  }

  async setupDirs(index) {
    const storageManager = this.storageManager;
    this.index = index;
    this.videoDir = await storageManager.createSubDataDir('video');
    this.videoPath = path.join(this.videoDir, index + '.mp4');
    await storageManager.createSubDataDir(
      path.join('video', 'images', '' + index)
    );
  }

  /**
   * Start recoding a video.
   * @returns {Promise} Promise object that represents when the video started
   */
  async record() {
    return this.recorder.start();
  }

  /**
   * Stop recording the video.
   * @returns {Promise} Promise object that represents when the video stopped
   */
  async stop() {
    return this.recorder.stop(this.videoPath);
  }

  /**
   * Get an array of operations that will post process the video.
   * Post process can be run visual metrics, finetune the final video
   * and/or just remove the video.
   */
  async postProcessing(results) {
    if (this.options.visualMetrics) {
      await runVisualMetrics(
        this.videoDir,
        this.videoPath,
        this.index,
        results,
        this.storageManager,
        this.options
      );
    }
    if (this.options.video) {
      await finetuneVideo(
        this.videoDir,
        this.videoPath,
        this.index,
        results,
        this.options
      );
    } else {
      await removeVideo(this.videoDir);
    }
  }
}

module.exports = Video;
