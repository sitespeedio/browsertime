'use strict';

const Promise = require('bluebird');
const fs = require('fs');

module.exports = {
  run(context) {
    const taskData = context.taskData;
    context.log.debug('Pull netlog');
    const file = `/sdcard/chromeNetlog-${context.index}.json`;
    return taskData.client
      .pull(taskData.deviceid, file)
      .then(function(transfer) {
        return new Promise(function(resolve, reject) {
          var fn = `${context.options
            .baseDir}/chromeNetlog-${context.index}.json`;
          transfer.on('end', function() {
            resolve(taskData.deviceid);
          });
          transfer.on('error', reject);
          transfer.pipe(fs.createWriteStream(fn));
        });
      });
  }
};
