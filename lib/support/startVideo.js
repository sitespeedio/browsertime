'use strict';
let webdriver = require('selenium-webdriver'),
 spawn = require('child_process').spawn,
 log = require('intel'),
 url = require('url');

function getArgs(testUrl, data, options, dataDir, index) {
  data.dir = dataDir;
  data.name = url.parse(testUrl).hostname;
  // caclulate the viewport, lets spend some time and make this better
  let size = '1366x708';
  if (options.viewPort) {
    let widthAndHeight = options.viewPort.split('x');
    size = widthAndHeight[0] + 'x' + (parseInt(widthAndHeight[1]) - 60);
  }

  // TODO lets make the record with better quality
  // TODO the output dir is hardcoded, we should get that from the context
  return ['-y', '-framerate', '30', '-video_size', size, '-f', 'x11grab', '-i', ':99.0+0,60', data.dir + '/' + data.name + '-run-' + index + '.mpg'];
}

function startFFMpeg(args, data, exitCallback) {

  let ffmpeg = spawn('ffmpeg', args);
  log.debug('Spawning ffmpeg ' + args.join(' '));

  // lets keep the ffmpeg instance in the context so we can close it in the post task
  data.ffmpeg = ffmpeg;
  ffmpeg.on('exit', exitCallback);
  ffmpeg.stderr.on('data', function(data) {
    log.verbose('ffmpeg: ' + data);
  });
}

module.exports = {
  run(context) {
    // start(runner, testUrl, options, data, index) {
    return context.runWithDriver((driver) => {
      // start on a blank page and lets make the background orange
      // that will make it easier for VisualMetrics to know when the
      // page is requested
      return driver.get('data:text/html;charset=utf-8,')
        .then(() => {
          return driver.executeScript('document.body.style.background = \"#DE640D\"');
        })
        .then(() => context.storageManager.createSubDataDir('video'))
        .then((dataDir) => {
          startFFMpeg(getArgs(context.url, context.taskData, context.options, dataDir, context.index), context.taskData, function() {
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
