/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Stats = require('fast-stats').Stats,
  fs = require('fs'),
  async = require('async'),
  path = require('path'),
  MobProxy = require('./mobproxy'),
  validBrowsers = ['chrome', 'firefox', 'phantomjs'];

function BT() {}

function help() {
  console.log(' -u  the URL to test');
  console.log(' -f  base file name');
  console.log(' -b the browser to use, use one of the following:' + validBrowsers);
  console.log(' -n the number of runs [7]');
  console.log(' --userAgent the user agent String');
  console.log(' -w the screensize wXh');
  console.log(' --scriptPath the path to an alternative script folder');
  console.log(' --headers request headers in the format of ...');
  console.log(' --basicAuth login:password for basic auth');
}

BT.prototype.fetch = function(options, cb) {

  cb = cb || function() {};

  this._checkInput(options);

  var work = [];
  var result = [];
  var self = this;
  var scripts = [];

  // read all the scripts
  var rootPath = path.join(__dirname, 'scripts', path.sep);
  fs.readdirSync(rootPath).forEach(function(file) {
    scripts.push(require(rootPath + file));
  });

  // get scripts from your own configured script dir
  if (options.scriptPath) {
    var p = path.resolve(options.scriptPath);

    fs.readdirSync(p).forEach(function(file) {
      scripts.push(require(p + path.sep + file));
    });
  }

  var mobProxy = new MobProxy({
    port: 10800
  });

  mobProxy.start(function() {

    for (var i = 0; i < options.runs; i++) {
      work.push(function(callback) {
        if (i !== 0) mobProxy.newPage('run' + i);
        var driver = require(path.join(__dirname, 'browsers', path.sep, options.browser)).getDriver(options);

        // fetch the URL and wait until the load event ends or we get the time out
        driver.get(options.url);
        driver.wait(function() {
          return driver.executeScript('return window.performance.timing.loadEventEnd>0').then(function(fetched) {
            return fetched;
          });
        }, 60000);

        // lets run all scripts
        var promises = [];
        scripts.forEach(function(script) {
          promises.push(driver.executeScript(script));
        });

        var callbacks = [];
        promises.forEach(function(promise) {
          callbacks.push(function(cb) {
            promise.then(function(value) {
              cb(null, value);
            });
          });
        });

        // when we are finished, push the result and stop the browser
        async.parallel(callbacks,
          function(err, results) {
            result.push(results);
            driver.quit();
            callback();
          });
      });
    }

    // create statistics for the values we want
    // this should be done cleaner
    async.series(work,
      function(err, results) {
        // fetch timings for each run and make some statistics
        var timings = {};
        result.forEach(function(run) {
          run.forEach(function(metric) {
            self._setupTimingsStatistics(timings, metric);
            self._setupStatistics(timings, metric, 'speedIndex');
            self._setupStatistics(timings, metric, 'firstPaint');
            self._setupUserTimingsStatistics(timings, metric);
          });
        });

        var data = {
          url: options.url,
          browser: options.browser,
          runs: options.times,
          statistics: self._formatStatistics(timings),
          data: result
        };

        // lets store the files
        async.parallel([

            function(callback) {
              fs.writeFile(path.join(__dirname, options.filename + '.json'), JSON.stringify(data), function(err) {
                if (err) throw err;
                callback();
              });
            },
            function(callback) {
              mobProxy.saveHar(path.join(__dirname, options.filename + '.har'), function() {
                mobProxy.stop(callback);
              });
            }
          ],
          // optional callback
          function(err, results) {
            console.log('stored the files ...');
            cb();
          });
      });

  });
};


BT.prototype._setupTimingsStatistics = function(timings, metric) {
  if (metric.timings) {
    Object.keys(metric.timings).forEach(function(timing) {
      if (timings[timing]) {
        timings[timing].push(metric.timings[timing]);
      } else {
        timings[timing] = new Stats().push(metric.timings[timing]);
      }
    });
  }
};

BT.prototype._setupUserTimingsStatistics = function(timings, metric) {
  if (metric.userTiming && metric.userTiming.marks) {
    metric.userTiming.marks.forEach(function(mark) {
      if (timings[mark.name]) {
        timings[mark.name].push(mark.startTime);
      } else {
        timings[mark.name] = new Stats().push(mark.startTime);
      }
    });
  }
};

BT.prototype._setupStatistics = function(timings, metric, name) {
  if (metric[name]) {
    if (timings[name]) {
      timings[name].push(metric[name]);
    } else {
      timings[name] = new Stats().push(metric[name]);
    }
  }
};

BT.prototype._checkInput = function(options) {

  if (options.help) {
    help();
    process.exit(0);
  }

  if (!options.url) {
    console.error('Missing url');
    help();
    process.exit(255);
  }
  if (!options.browser) {
    options.browser = 'chrome';
  } else if (validBrowsers.indexOf(options.browser) < 0) {
    console.error('Browsertime dont support ' + options.browser);
    help();
    process.exit(255);
  }

  if (!options.runs) {
    options.runs = 7;
  }

  if (!options.filename) {
    options.filename = 'hepp';
  }

  // always use the bmp for now
  options.proxy = 'localhost:10800';
};


BT.prototype._formatStatistics = function(timings) {
  var data = {};

  Object.keys(timings).forEach(function(timing) {
    var stats = timings[timing];
    var decimals = 0;
    data[timing] = {
      min: stats.percentile(0).toFixed(decimals),
      max: stats.percentile(100).toFixed(decimals),
      p10: stats.percentile(10).toFixed(decimals),
      p70: stats.percentile(70).toFixed(decimals),
      p80: stats.percentile(80).toFixed(decimals),
      p90: stats.percentile(90).toFixed(decimals),
      p99: stats.percentile(99).toFixed(decimals),
      median: stats.median().toFixed(decimals),
      mean: stats.amean().toFixed(decimals)
    };
  });

  return data;
};



module.exports = BT;