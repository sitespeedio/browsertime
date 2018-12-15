'use strict';
const path = require('path');
const get = require('lodash.get');
const getRecorder = require('./screenRecording/recorder');
const getVideoMetrics = require('./postprocessing/visualmetrics/single/getVideoMetrics');
const finetuneVideo = require('./postprocessing/finetune/');
const split = require('./postprocessing/visualmetrics/multiple/split');
const combine = require('./postprocessing/visualmetrics/multiple/combine');
const fileUtil = require('../support/fileUtil');

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

  async split() {
    return split(this.videoPath, this.videoDir, this.index, this.options);
  }

  async combine(pageNumber, visualElements, timingMetrics) {
    let visualElementsFile;
    if (visualElements && this.options.visualElements) {
      await this.storageManager.writeJson(
        this.index + '-visualElements.json',
        visualElements,
        true
      );
      visualElementsFile = path.join(
        this.storageManager.directory,
        this.index + '-visualElements.json.gz'
      );
    }
    const result = await combine(
      this.videoDir,
      pageNumber,
      this.index,
      visualElementsFile,
      timingMetrics,
      this.options
    );
    if (visualElements && this.options.visualElements) {
      await this.storageManager.rm(this.index + '-visualElements.json.gz');
    }
    return result;
  }

  async cleanup() {
    // Keep or remove the original file
    if (get(this.options, 'videoParams.keepOriginalVideo', false)) {
      const originalFile = path.join(
        this.videoDir,
        this.index + '-original.mp4'
      );
      await fileUtil.rename(this.videoPath, originalFile);
    } else {
      await fileUtil.removeFile(this.videoPath);
    }
    // Remove all tmp videos (and screenshots)
    return fileUtil.removeDirAndFiles(path.join(this.videoDir, 'tmp'));
  }

  /**
    Post process video: get visual metrics, finetune the video and remove it 
    if you don't want it
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
        await fileUtil.removeByType(this.videoDir, 'mp4');
      }
    }
    return videoMetrics;
  }
}

module.exports = Video;
