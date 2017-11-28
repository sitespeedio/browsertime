'use strict';

const Promise = require('bluebird');
const fs = require('fs');
const get = require('lodash.get');
const convert = require('../finetune/convertToFps');

module.exports = {
  run(context) {
    const taskData = context.taskData;
    const videoWait = get(
      context,
      'options.videoParams.androidVideoWaitTime',
      5000
    );

    context.log.debug('Stop screenrecord');
    return (
      taskData.client
        .shell(
          taskData.deviceid,
          'kill -2 $(ps screenrecord | grep -Eo [0-9]+ | grep -m 1 -Eo [0-9]+)'
        )
        // give the phone the time needed to process the video
        .then(() => Promise.delay(videoWait))
        .then(() => {
          return taskData.client
            .pull(taskData.deviceid, taskData.sdcard + '/browsertime.mp4')
            .then(function(transfer) {
              return new Promise(function(resolve, reject) {
                var fn = taskData.mpegPath;
                transfer.on('end', function() {
                  context.log.info(
                    'Finished transfering the video from mobile to your server'
                  );
                  taskData.videoPaths = taskData.videoPaths || {};
                  taskData.videoPaths['' + context.index] = taskData.mpegPath;
                  convert.convert(context).then(() => {
                    resolve(taskData.deviceid);
                  });
                });
                transfer.on('error', reject);
                transfer.pipe(fs.createWriteStream(fn));
              });
            });
        })
    );
  }
};
