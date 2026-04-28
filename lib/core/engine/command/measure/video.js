import { Video } from '../../../../video/video.js';
import { setOrangeBackground } from '../../../../video/screenRecording/setOrangeBackground.js';
import { isAndroidConfigured } from '../../../../android/index.js';
import { getProperty } from '../../../../support/util.js';
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Handles video recording during measurement.
 * @class
 * @private
 */
export class MeasureVideo {
  constructor(storageManager, browser, videos, options) {
    this.storageManager = storageManager;
    this.browser = browser;
    this.videos = videos;
    this.options = options;
    this.recordVideo = options.visualMetrics || options.video;
    this.ANDROID_DELAY_TIME = getProperty(
      options,
      'orangeAndroidDelayTime',
      2000
    );
    this.IOS_DELAY_TIME = getProperty(options, 'orangeIosDelayTime', 1000);
    this.DESKTOP_DELAY_TIME = getProperty(
      options,
      'orangeDesktopDelayTime',
      800
    );
  }

  async start(numberOfMeasuredPages, index) {
    this.video = new Video(this.storageManager, this.options, this.browser);

    if (this.options.firefox && this.options.firefox.windowRecorder) {
      // The Firefox window recorder will only record subsequent
      // changes after recording has begun.  So the orange frame needs
      // to come after we start recording.
      await this.video.record(numberOfMeasuredPages, index);
      await setOrangeBackground(this.browser.getDriver(), this.options);
    } else {
      await setOrangeBackground(this.browser.getDriver(), this.options);
      await this.video.record(numberOfMeasuredPages, index);
    }

    // Give ffmpeg/video on phone time to settle
    if (isAndroidConfigured(this.options)) {
      return delay(this.ANDROID_DELAY_TIME);
    } else if (this.options.safari && this.options.safari.ios) {
      return delay(this.IOS_DELAY_TIME);
    } else if (this.options.safari && this.options.safari.useSimulator) {
      return delay(this.IOS_DELAY_TIME);
    } else {
      return delay(this.DESKTOP_DELAY_TIME);
    }
  }

  async stop(url) {
    if (this.recordVideo && !this.options.videoParams.debug) {
      await this.video.stop(url);
      this.videos.push(this.video);
    }
  }

  getRecordingMetadata() {
    if (
      this.recordVideo &&
      !this.options.videoParams.debug &&
      this.video &&
      this.video.getRecordingStartTime()
    ) {
      return {
        recordingStartTime: Number.parseFloat(
          this.video.getRecordingStartTime()
        ),
        timeToFirstFrame: Number.parseInt(this.video.getTimeToFirstFrame(), 10)
      };
    }
    return;
  }

  shouldRecord() {
    return this.recordVideo && !this.options.videoParams.debug;
  }
}
