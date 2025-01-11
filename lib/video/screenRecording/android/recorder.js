import { promisify } from 'node:util';
import { unlink as _unlink } from 'node:fs';
import { getLogger } from '@sitespeed.io/log';
import { framerate } from '../../defaults.js';
import { Android } from '../../../android/index.js';
import { getProperty } from '../../../support/util.js';

const unlink = promisify(_unlink);
const log = getLogger('browsertime.video');
const delay = ms => new Promise(res => setTimeout(res, ms));

export class AndroidRecorder {
  constructor(options) {
    this.waitTime = getProperty(
      options,
      'videoParams.androidVideoWaitTime',
      5000
    );
    this.framerate = getProperty(options, 'videoParams.framerate', framerate);
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
      } catch {
        // Nothing to see here
      }
    }
    await this.android.pullVideo(destination);
    return this.android.removeVideo();
  }
}
