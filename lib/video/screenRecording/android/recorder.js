'use strict';

const Promise = require('bluebird');
const adb = require('adbkit');
const get = require('lodash.get');
const log = require('intel');
const fs = require('fs');

function videoPathOnCard(card) {
  return `${card}/browsertime.mp4`;
}

module.exports = class AndroidRecorder {
  constructor(options) {
    this.client = adb.createClient();
    this.deviceId = get(options, 'chrome.android.deviceSerial');
    this.waitTime = get(options, 'videoParams.androidVideoWaitTime', 5000);
  }

  async _exec(cmd) {
    return this.client.shell(this.deviceId, cmd).then(adb.util.readAll);
  }

  async start() {
    if (this.deviceId === undefined) {
      const devices = await this.client.listDevices();
      this.deviceId = devices[0].id;
    }
    log.info('Start screen recording on device %s', this.deviceId);

    const output = await this._exec('echo $EXTERNAL_STORAGE');
    this.sdcard = output.toString().trim();

    return this._exec(
      `screenrecord --bit-rate 8000000 ${videoPathOnCard(this.sdcard)}`
    );
  }

  async stop(destination) {
    log.debug('Stop screen recording');

    await this._exec(
      'kill -2 $(ps screenrecord | grep -Eo [0-9]+ | grep -m 1 -Eo [0-9]+)'
    );

    await Promise.delay(this.waitTime);

    const stream = await this.client.pull(
      this.deviceId,
      videoPathOnCard(this.sdcard)
    );

    await new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('end', resolve);

      stream.pipe(fs.createWriteStream(destination));
    });

    // await this._exec(`rm ${videoPathOnCard(this.sdcard)}`);
  }
};
