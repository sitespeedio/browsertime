'use strict';

const webdriver = require('selenium-webdriver'),
  spawn = require('child_process').spawn,
  log = require('intel'),
  path = require('path');

function getFFMpegArgs(mpegPath, options) {
  // calculate the viewport, lets spend some time and make this better
  let size = '1366x708';
  if (options.viewPort) {
    let widthAndHeight = options.viewPort.split('x');
    size = widthAndHeight[0] + 'x' + (parseInt(widthAndHeight[1]) - 60);
  }

  // TODO lets make the record with better quality
  return ['-y', '-framerate', '30', '-video_size', size, '-f', 'x11grab', '-i', ':99.0+0,60', mpegPath];
}

function startFFMpeg(args) {
  const ffmpeg = spawn('ffmpeg', args);
  log.debug('Spawning ffmpeg ' + args.join(' '));

  ffmpeg.on('exit', function() {
    log.debug('Finished recording video');
  });
  ffmpeg.stderr.on('data', function(data) {
    log.verbose('ffmpeg: ' + data);
  });

  return ffmpeg;
}

module.exports = {
  run(context) {
    // start(runner, testUrl, options, data, index) {
    return context.runWithDriver((driver) => {
      const storageManager = context.storageManager,
        taskData = context.taskData;

      // start on a blank page and lets make the background orange
      // that will make it easier for VisualMetrics to know when the
      // page is requested
      return driver.get('data:text/html;charset=utf-8,')
        .then(() => driver.executeScript('document.body.style.background = \"#DE640D\"'))
        .then(() => storageManager.createSubDataDir('video'))
        .then((dataDir) => {
          const fileName = storageManager.pathNameFromUrl(context.url) + '-' + context.index + '.mpg',
            mpegPath = path.join(dataDir, fileName);

          // lets keep the ffmpeg instance in the context so we can close it in the post task
          taskData.mpegPath = mpegPath;
          taskData.dataDir = dataDir;
          taskData.ffmpeg = startFFMpeg(getFFMpegArgs(mpegPath, context.options));
        })
        .then(() => {
          // lets wait so that FFmpeg has started before we navigate to the URL
          return webdriver.promise.delayed(2000);
        })
        .then(() => {
          // we are ready! Make the background white and let Browsertime do the
          // work
          return driver.executeScript('document.body.style.background = \"#FFFFFF\"');
        });

    });
  }
};
