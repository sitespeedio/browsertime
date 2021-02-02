const log = require('intel').getLogger('browsertime.video');
const path = require('path');
const execa = require('execa');
const util = require('util');
const fs = require('fs');
const unlink = util.promisify(fs.unlink);
const convert = require('./convertToMp4');
const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = class IOSSimulatorRecorder {
  constructor(options, baseDir) {
    this.options = options;
    this.tmpVideo = path.join(baseDir, 'tmp.mov');
  }

  async start() {
    log.info('Start IOS Simulator recorder.');

    this.xcrunProcess = execa.command(
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
    return Promise.resolve(this.xcrunProcess);
  }
};
