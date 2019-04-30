'use strict';

const adb = require('adbkit');
const get = require('lodash.get');
const fs = require('fs');
const log = require('intel').getLogger('browsertime.android');

class Android {
  constructor(options) {
    this.client = adb.createClient();
    this.id = get(options, 'chrome.android.deviceSerial', get(options, 'firefox.android.deviceSerial'));
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

  async pidof(packageName) {
    const cmd1 = `pidof ${packageName}`;
    log.info(`pidof ${cmd1}`);
    const proc1 = await this._runCommand(cmd1);
    const ps1 = await adb.util.readAll(proc1);
    var ps = ps1.toString();
    log.info(`pidof ${ps}`);

    if (ps && !Number.isNaN(Number.parseInt(ps.trim()))) {
      return Number.parseInt(ps.trim());
    }

    const cmd2 = `ps -o PID,NAME | grep ' ${packageName}$'`;
    log.info(`pidof ${cmd2}`);
    const proc2 = await this._runCommand(cmd2);
    const ps2 = await adb.util.readAll(proc2);
    var ps = ps2.toString();
    log.info(`pidof ${ps}`);

    for (const line in ps.split(/[\r\n]+/)) {
      const parts = line.trim().split(' ');
      if (parts.length == 2 && parts[0] === packageName && !Number.isNaN(Number.parseInt(parts[1].trim()))) {
        return Number.parseInt(parts[1].trim());
      }
    }

    return null;
  }

  async _processStartTime(pid) {
    // See https://stackoverflow.com/a/26538424 and others for
    // determining process start time.  See
    // https://stackoverflow.com/a/44524937 for determining USER_HZ
    // (Linux kernel jiffies per second) without using syscall.  See
    // https://stackoverflow.com/questions/16548528/command-to-get-time-in-milliseconds#comment33215571_16548827
    // for the date formatting trick.
    const MILLIS_PER_S = 1000;

    // It seems that `cut` is more common than `awk`, especially on older OS versions.
    const cut = `date +%s%3N && cut -F 1 /proc/uptime && cut -F 22 /proc/self/stat /proc/${pid}/stat`;
    // const awk = `date +%s%3N && awk '{print $1}' /proc/uptime && awk '{print $22}' /proc/self/stat /proc/${pid}/stat`;
    const stat_and_timestamp = await this._runCommand(awk);
    const output = (await adb.util.readAll(stat_and_timestamp)).toString();

    var [date_in_ms,
         system_uptime_in_s,
         awk_start_time_after_system_start_time_in_jiffies,
         process_start_time_after_system_start_time_in_jiffies] = output.trim().split(/[\r\n]+/).map(v => Number.parseFloat(v.trim()));
    // Usually 100, but this isn't strictly guaranteed by Android.
    const jiffes_per_s = Math.round(awk_start_time_after_system_start_time_in_jiffies / system_uptime_in_s);

    const process_start_time_in_ms = date_in_ms - (MILLIS_PER_S * system_uptime_in_s) + (process_start_time_after_system_start_time_in_jiffies * MILLIS_PER_S / jiffes_per_s);
    const obj = {
      date_in_ms,
      system_uptime_in_s,
      awk_start_time_after_system_start_time_in_jiffies,
      process_start_time_after_system_start_time_in_jiffies,
      jiffes_per_s,
      process_start_time_in_ms
    };
    // log.debug(`_processStartTime`, obj); // Too verbose for regular use.

    return obj;
  }

  async processStartTime(pid, count = 3) {
    // This is inheritently racy and therefore noisy.  Average `count` trials.
    var total = 0;
    for (var i = 0; i < count; i++) {
      const obj = await this._processStartTime(pid);
      total += obj.process_start_time_in_ms;
    }
    return Math.round(total / count);
  }
}

module.exports = {
  createAndroidConnection(options) {
    return new Android(options);
  },
  isAndroidConfigured(options) {
    return get(options, 'chrome.android.package', get(options, 'firefox.android.package', false)) ? true : false;
  }
};
