'use strict';
let webdriver = require('selenium-webdriver'),
 spawn = require('child_process').spawn,
 log = require('intel'),
 StorageManager = require('../support/storageManager'),
 url = require('url');

function getArgs(testUrl, data, options) {
  data.name = url.parse(testUrl).hostname;

  const storageManager = new StorageManager(testUrl, options);
  data.dir = storageManager.directory;
  // caclulate the viewport, lets spend some time and make this better
  let size = '1366x708';
  if (options.viewPort) {
    let widthAndHeight = options.viewPort.split('x');
    size = widthAndHeight[0] + 'x' + (parseInt(widthAndHeight[1]) - 60);
  }

  // keep track of how many runs we've done
  if (data.run) {
    data.run += 1;
  } else {
    data.run = 1;
  }

  // TODO lets make the record with better quality
  // TODO the output dir is hardcoded, we should get that from the context
  return ['-y', '-framerate', '30', '-video_size', size, '-f', 'x11grab', '-i', ':99.0+0,60', data.dir + '/' + data.name + '-run-' + data.run + '.mpg'];
}

function startFFMpeg(args, data, exitCallback) {

  let ffmpeg = spawn('ffmpeg', args);
  log.debug('Spawning ffmpeg ' + args.join(' '));

  // lets keep the ffmpeg instance in the context so we can close it in the post task
  data.ffmpeg = ffmpeg;
  ffmpeg.on('exit', exitCallback);
  ffmpeg.stderr.on('data', function(data) {
    log.error('Error from ffmpeg:' + data);
  });
}

module.exports = {
  start(runner, testUrl, options, data) {
    return runner.runWithDriver((driver) => {
      // start on a blank page and lets make the background orange
      // that will make it easier for VisualMetrics to know when the
      // page is requested
      return driver.get('data:text/html;charset=utf-8,')
        .then(() => {
          return driver.executeScript('document.body.style.background = \"#DE640D\"');
        })
        .then(() => {
          startFFMpeg(getArgs(testUrl, data, options), data, function() {
              log.debug('Finished recording video');
          });
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
