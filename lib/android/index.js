'use strict';

const adb = require('adbkit');
const get = require('lodash.get');
const fs = require('fs');
const log = require('intel');

class Android {
  constructor(options) {
    this.options = options;
  }

  async getSdCard() {
    return this.client
      .shell(this.id, 'echo $EXTERNAL_STORAGE')
      .then(adb.util.readAll)
      .then(output => output.toString().trim());
  }

  async initConnection() {
    this.client = adb.createClient();
    this.id = get(this.options, 'chrome.android.deviceSerial');

    if (this.id) {
      return this.getSdCard().then(output => (this.sdcard = output));
    } else {
      return this.client
        .listDevices()
        .then(devices => {
          // just take the first phone online
          this.id = devices[0].id;
        })
        .then(() => this.getSdCard().then(output => (this.sdcard = output)));
    }
  }

  async removeFileOnSdCard(file) {
    return this.client.shell(this.id, 'rm ' + this.sdcard + '/' + file);
  }

  async pullNetLog(index) {
    const file = `${this.sdcard}/chromeNetlog-${index}.json`;
    const options = this.options;
    log.info('Pull netlog from %s', this.id);
    return this.client.pull(this.id, file).then(function(transfer) {
      return new Promise(function(resolve, reject) {
        const fn = `${options.baseDir}/chromeNetlog-${index}.json`;
        transfer.on('end', function() {
          resolve();
        });
        transfer.on('error', reject);
        transfer.pipe(fs.createWriteStream(fn));
      });
    });
  }

  async startVideo() {
    return this.client.shell(
      this.id,
      'screenrecord --bit-rate 8000000 ' + this.sdcard + '/browsertime.mp4'
    );
  }

  async stopVideo() {
    return this.client.shell(
      this.id,
      'kill -2 $(ps screenrecord | grep -Eo [0-9]+ | grep -m 1 -Eo [0-9]+)'
    );
  }

  async pullVideo(toPath) {
    return this.client
      .pull(this.id, this.sdcard + '/browsertime.mp4')
      .then(function(transfer) {
        return new Promise(function(resolve, reject) {
          transfer.on('end', function() {
            resolve();
          });
          transfer.on('error', reject);
          transfer.pipe(fs.createWriteStream(toPath));
        });
      });
  }
}

module.exports = Android;
