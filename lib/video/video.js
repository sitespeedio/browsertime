import path from 'node:path';
import { getRecorder } from './screenRecording/recorder.js';
import { getVideoMetrics } from './postprocessing/visualmetrics/getVideoMetrics.js';
import { finetuneVideo } from './postprocessing/finetune/index.js';
import { rename, removeFile, removeDirAndFiles } from '../support/fileUtil.js';
import { pathToFolder } from '../support/pathToFolder.js';
import { getProperty } from '../support/util.js';
/**
 * Create a new Video that handles everything with the video
 * @class
 */
export class Video {
  constructor(storageManager, options, browser) {
    this.options = options;
    this.storageManager = storageManager;
    this.tmpDir = storageManager.directory;
    this.recorder = getRecorder(options, browser, this.tmpDir);
    this.isRecording = false;
  }

  async setupDirs(index, url) {
    const storageManager = this.storageManager;
    this.index = index;

    this.videoDir = await storageManager.createSubDataDir(
      path.join(pathToFolder(url, this.options), 'video')
    );

    await storageManager.createSubDataDir(
      path.join(pathToFolder(url, this.options), 'video', 'images', '' + index)
    );

    this.filmstripDir = await storageManager.createSubDataDir(
      path.join(pathToFolder(url, this.options), 'filmstrip', '' + index)
    );
  }

  /**
   * Start recoding a video.
   * @returns {Promise} Promise object that represents when the video started
   */
  async record(pageNumber, index, visitedPageNumber) {
    this.pageNumber = pageNumber;
    this.index = index;
    this.visitedPageNumber = visitedPageNumber;
    // skip recording if we already have one going
    if (!this.isRecording) {
      this.isRecording = true;
      let temporary = path.join(this.tmpDir, 'x11-tmp.mp4');
      return this.recorder.start(temporary);
    }
  }

  /**
   * Stop recording the video.
   * @returns {Promise} Promise object that represents when the video stopped
   */
  async stop(url) {
    this.isRecording = false;
    if (url === undefined) {
      return this.recorder.stop(this.videoPath);
    } else {
      this.videoPath = path.join(
        this.storageManager.directory,
        pathToFolder(url, this.options),
        'video',
        this.index + '.mp4'
      );
      await this.setupDirs(this.index, url);
      return this.recorder.stop(this.videoPath);
    }
  }

  async cleanup() {
    // Keep or remove the original file
    if (getProperty(this.options, 'videoParams.keepOriginalVideo', false)) {
      const originalFile = path.join(
        this.videoDir,
        this.index + '-original.mp4'
      );
      await rename(this.videoPath, originalFile);
    } else {
      await removeFile(this.videoPath);
    }
    // Remove all tmp videos (and screenshots)
    return removeDirAndFiles(path.join(this.videoDir, 'tmp'));
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
        this.filmstripDir,
        this.videoPath,
        this.index,
        visualElements,
        this.storageManager,
        this.pageNumber,
        this.visitedPageNumber,
        this.options
      );
    }
    await (this.options.video === true
      ? finetuneVideo(
          this.videoDir,
          this.videoPath,
          this.index,
          videoMetrics,
          timingMetrics,
          this.options
        )
      : removeFile(this.videoPath));
    return videoMetrics;
  }

  getRecordingStartTime() {
    return this.recorder.recordingStartTime;
  }

  getTimeToFirstFrame() {
    return this.recorder.timeToFirstFrame;
  }
}
