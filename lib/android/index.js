'use strict';

const adb = require('adbkit');
const get = require('lodash.get');
const fs = require('fs');
const log = require('intel').getLogger('browsertime.android');

class Android {
  constructor(options) {
    this.client = adb.createClient();
    this.id = get(options, 'chrome.android.deviceSerial');
  }

  async initConnection() {
    if (!this.id) {
      const devices = await this.client.listDevices();
      // just take the first phone online
      this.id = devices[0].id;
    }

    const data = await this._runCommand('echo $EXTERNAL_STORAGE');
    const output = await adb.util.readAll(data);
    this.sdcard = output.toString().trim();
  }

  async _runCommand(command) {
    return this.client.shell(this.id, command);
  }

  async _downloadFile(sourcePath, destinationPath) {
    const transfer = await this.client.pull(this.id, sourcePath);

    return new Promise((resolve, reject) => {
      transfer.on('end', function() {
        resolve();
      });
      transfer.on('error', reject);
      transfer.pipe(fs.createWriteStream(destinationPath));
    });
  }

  async removeFileOnSdCard(file) {
    return this._runCommand(`rm ${this.sdcard}/${file}`);
  }

  async pullNetLog(destination) {
    const sourcePath = `${this.sdcard}/chromeNetlog.json`;
    log.info(`Pulling netlog from ${this.id}`);

    return this._downloadFile(sourcePath, destination);
  }

  async startVideo() {
    return this._runCommand(
      `screenrecord --bit-rate 8000000 ${this.sdcard}/browsertime.mp4`
    );
  }

  async stopVideo() {
    return this._runCommand(
      'command -v pkill >/dev/null && pkill -l SIGINT screenrecord || kill -2 $(ps screenrecord | grep -Eo [0-9]+ | grep -m 1 -Eo [0-9]+)'
    );
  }

  async pullVideo(destinationPath) {
    const sourcePath = `${this.sdcard}/browsertime.mp4`;

    return this._downloadFile(sourcePath, destinationPath);
  }
}

module.exports = {
  createAndroidConnection(options) {
    return new Android(options);
  },
  isAndroidConfigured(options) {
    return get(options, 'chrome.android.package', false) ? true : false;
  }
};
