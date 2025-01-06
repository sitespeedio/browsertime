import path from 'node:path';
import { promisify } from 'node:util';
import fs from 'node:fs';
import { execaCommand } from 'execa';
import { getLogger } from '@sitespeed.io/log';
import { convert } from './convertToMp4.js';
const unlink = promisify(fs.unlink);
const delay = ms => new Promise(res => setTimeout(res, ms));
const log = getLogger('browsertime.video');

export class IOSSimulatorRecorder {
  constructor(options, baseDir) {
    this.options = options;
    this.tmpVideo = path.join(baseDir, 'tmp.mov');
  }

  async start() {
    log.info('Start IOS Simulator recorder.');

    this.xcrunProcess = execaCommand(
      'xcrun simctl io ' +
        this.options.safari.deviceUDID +
        ' recordVideo --code=h264 --mask=black --force ' +
        this.tmpVideo,
      { shell: true }
    );
  }

  async stop(destination) {
    log.info('Stop IOS Simulator recorder.');

    await this.xcrunProcess.kill('SIGINT', {
      forceKillAfterTimeout: 2000
    });

    await delay(2500);
    await convert(this.tmpVideo, destination);
    await unlink(this.tmpVideo);
    return this.xcrunProcess;
  }
}
