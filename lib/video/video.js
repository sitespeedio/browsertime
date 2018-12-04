'use strict';
const path = require('path');
const getRecorder = require('./screenRecording/recorder');
const getVideoMetrics = require('./postprocessing/visualmetrics/getVideoMetrics');
const removeVideo = require('./postprocessing/removeVideo');
const finetuneVideo = require('./postprocessing/finetune/');

/**
 * Create a new Video that handles everything with the video
 * @class
 */
class Video {
  constructor(storageManager, options) {
    this.options = options;
    this.storageManager = storageManager;
    this.recorder = getRecorder(options);
    this.isRecording = false;
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
    // skip recording if we already have one going
    if (!this.isRecording) {
      this.isRecording = true;
      return this.recorder.start();
    }
  }

  /**
   * Stop recording the video.
   * @returns {Promise} Promise object that represents when the video stopped
   */
  async stop() {
    this.isRecording = false;
    return this.recorder.stop(this.videoPath);
  }

  /**
    Post process video: get visual metrics, finetune the video and remove it 
    if you don't wan't it
   */
  async postProcessing(timingMetrics, visualElements) {
    let videoMetrics;
    if (this.options.visualMetrics) {
      videoMetrics = await getVideoMetrics(
        this.videoDir,
        this.videoPath,
        this.index,
        visualElements,
        this.storageManager,
        this.options
      );
      await finetuneVideo(
        this.videoDir,
        this.videoPath,
        this.index,
        videoMetrics,
        timingMetrics,
        this.options
      );
      if (!this.options.video) {
        await removeVideo(this.videoDir);
      }
    }
    return videoMetrics;
  }
}

module.exports = Video;
