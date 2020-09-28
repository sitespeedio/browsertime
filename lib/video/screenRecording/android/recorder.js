'use strict';
const util = require('util');
const fs = require('fs');
const get = require('lodash.get');
const log = require('intel').getLogger('browsertime.video');
const videoDefaults = require('../../defaults');
const { Android } = require('../../../android');
const unlink = util.promisify(fs.unlink);

const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = class AndroidRecorder {
  constructor(options) {
    this.waitTime = get(options, 'videoParams.androidVideoWaitTime', 5000);
    this.framerate = get(
      options,
      'videoParams.framerate',
      videoDefaults.framerate
    );
    this.options = options;
  }

  async start() {
    this.android = new Android(this.options);
    return this.android.startVideo();
  }

  async stop(destination) {
    log.debug('Stop screen recording');
    await this.android.stopVideo();
    // We want to wait some extra time for the video to land on the device
    await delay(this.waitTime);
    // The destination file could exist of we use --resultDir
    // so make sure we remove it first
    if (this.options.resultDir) {
      try {
        await unlink(destination);
      } catch (e) {
        // Nothing to see here
      }
    }
    await this.android.pullVideo(destination);
    return this.android.removeVideo();
  }
};
