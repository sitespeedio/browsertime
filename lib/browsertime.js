/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var stats = require('./statistics'),
    fs = require('fs'),
    async = require('async'),
    path = require('path'),
    logger = require('./logger'),
    url = require('url'),
    util = require('util'),
    EventEmitter = require('async-node-events'),
    webdriver = require('selenium-webdriver');

var defaultWaitScript = 'return window.performance.timing.loadEventEnd>0';

function Browsertime(b) {
  this.log = logger.getLog();
  EventEmitter.call(this);
  this.result = [];
  this.scripts = [];
  this.browserVersion = '';
  this.os = '';
  this.browserName = '';
  this.userAgent = '';
  this.browsers = b;

}

util.inherits(Browsertime, EventEmitter);

Browsertime.prototype.fetch = function(options, callback) {

  callback = callback || function() {};

  this._setupDefaults(options);
  this._populateScripts(options);

  var self = this;

  async.series([
    function(cb) {
      self.emit('beforeRun', cb);
    },
    function(cb) {
      self._do(options, cb);
    },
    function(cb) {
      self.emit('afterRun', cb);
    }
  ], function(err) {
    callback(err);
  });
};

Browsertime.prototype._do = function(options, cb) {
  var browserRuns = [];
  var self = this;
  for (var i = 1; i <= options.runs; i++) {
    browserRuns.push(self._collectFromTheBrowser(options, i, options.runs));
  }

  async.series(browserRuns,
    function(err) {
      if (err) {
        self.log.error(err.message);
        return cb(err);
      }
      var data = self._getFormattedResult(options);
      self._saveToFile(data, options, cb);
    });
};

Browsertime.prototype._collectFromTheBrowser = function(options, iteration, totalIterations) {
  var self = this,
      log = this.log;
  var pageUrl = options.url,
      pageLoadTimeout = 60000;

  var waitScript = options.waitScript || defaultWaitScript;

  return function(callback) {
    webdriver.promise.controlFlow().on('uncaughtException', function(e) {
      callback(e);
    });

    async.series([
          function(cb) {
            self.emit('callingBrowser', cb);
          }
        ],
        function(err) {
          if (err) {
            return callback(err);
          }

          var driver = self.browsers.getBrowser(options.browser).getDriver(options);

          driver.getCapabilities().then(function(cap) {
            self.browserVersion = cap.get('version');
            self.os = cap.get('platform');
            self.browserName = cap.get('browserName');
          });

          // Not supported in Safari:
          // https://code.google.com/p/selenium/issues/detail?id=6015
          if (options.browser !== 'safari') {
            driver.manage().timeouts().pageLoadTimeout(60000);
          }
          driver.manage().timeouts().setScriptTimeout(60000);

          driver.manage().window().setPosition(0, 0);

          var windowSize = self._parseWindowSize(options.size);
          if (windowSize) {
            driver.manage().window().setSize(windowSize.x, windowSize.y);
          }

          // fetch the URL and wait until the load event ends or we get the time out
          log.info('Fetching ' + pageUrl + ' (' + iteration + ' of ' + totalIterations + ')');
          driver.get(pageUrl);

          var afterFetchTime = Date.now();

          driver.wait(function() {
                return driver.executeScript(waitScript)
                    .then(function(b) {
                      return b;
                    });
              },
              pageLoadTimeout
          ).then(function() {
                var afterLoadTime = Date.now();

                log.verbose('loading url took %d milliseconds', (afterLoadTime - afterFetchTime));
                // This is needed since the Firefox driver executes the success callback even when driver.wait
                // took too long.
                if ((afterLoadTime - afterFetchTime) > pageLoadTimeout) {
                  return callback(new Error('The url ' + pageUrl + ' timed out'));
                }

                // lets run all scripts
                var promises = [];
                self.scripts.forEach(function(script) {
                  promises.push({name: script.name, promise: driver.executeScript(script.script)});
                });

                var callbacks = [];
                promises.forEach(function(promise) {
                  callbacks.push(function(cb) {
                    promise.promise.then(function(value) {
                      var result = {};
                      result[promise.name] = value;
                      cb(null, result);
                    }, function(e) {
                      log.error('Error running script \'%s\': %s', promise.name, util.inspect(e));
                      cb(e);
                    });
                  });
                });

                // when we are finished, push the result and stop the browser
                async.parallel(callbacks,
                    function(e, results) {
                      if (e) {
                        return callback(e);
                      }
                      var eachRun = {};
                      results.forEach(function(metric) {
                        Object.keys(metric).forEach(function(key) {
                          eachRun[key] = metric[key];
                        });
                      });
                      self.result.push(eachRun);
                      driver.quit().thenFinally(function() {
                        return callback();
                      });
                    });
              },
              function() {

                var afterLoadTime = Date.now();

                log.verbose('loading url took %d milliseconds', (afterLoadTime - afterFetchTime));

                driver.quit().thenFinally(function() {
                  return callback(new Error('The url ' + pageUrl + ' timed out'));
                });
              });
        });
  };
};

Browsertime.prototype._getFormattedResult = function(options) {
  // fetch timings for each run and make some statistics
  var timings = {};
  this.result.forEach(function(run) {
    stats.setupTimingsStatistics(timings, run);
    stats.setupStatistics(timings, run, 'speedIndex');
    stats.setupStatistics(timings, run, 'firstPaint');
    stats.setupUserTimingsStatistics(timings, run);
    // Firefox has an extra toJSON method in the resource timings
    // lets skip that for the result
    if (run.resourceTiming) {
      run.resourceTiming.forEach(function(entry) {
        if (entry.toJSON) {
          entry.toJSON = undefined;
        }
      });
    }
  });

  return {
    url: options.url,
    runs: options.runs,
    browserName: this.browserName,
    browserVersion: this.browserVersion,
    platform: this.os,
    userAgent: options.userAgent || this.userAgent,
    windowSize: 'unknown',
    browserTimeVersion: require('../package.json').version,
    statistics: stats.formatStatistics(timings),
    data: this.result
  };
};

Browsertime.prototype._saveToFile = function(data, options, cb) {
  var self = this;

  // lets store the files
  async.parallel([
      function(callback) {
        fs.writeFile(options.filename, JSON.stringify(data), function(err) {
          self.log.info('Storing ' + options.filename);
          callback(err);
        });
      },
      function(callback) {
        self.emit('savingResults', { data: data }, callback);
      }
    ], cb);
};

Browsertime.prototype._setupDefaults = function(options) {

  options.runs = options.runs || 3;
  options.filename = options.filename || path.join(process.cwd(), url.parse(options.url).hostname + '.json');
  options.seleniumServer = options.seleniumServer || 'http://localhost:4444/wd/hub';
};

Browsertime.prototype._populateScripts = function(options) {
  var scriptRoots = [path.join(__dirname, 'scripts')];
  if (options.scriptPath) {
    scriptRoots.push(path.resolve(options.scriptPath));
  }

  var self = this;

  scriptRoots.forEach(function(rootPath) {
    fs.readdirSync(rootPath).forEach(function(file) {
      if (path.extname(file) === '.js') {
        self.scripts.push({
          name: path.basename(file, '.js'),
          script: fs.readFileSync(path.join(rootPath, file), {encoding: 'utf8'})
        });
      }
    });
  });
};

Browsertime.prototype._parseWindowSize = function(size) {
  if (!size) {
    return undefined;
  }

  var coordinates = size.split('x');
  var parsedSize;

  if (coordinates.length === 2) {
    parsedSize = {
      'x': parseInt(coordinates[0], 10),
      'y': parseInt(coordinates[1], 10)
    };
  }

  if (!parsedSize || isNaN(parsedSize.x) || isNaN(parsedSize.y)) {
    this.log.warn('%s is not a valid windows size. It needs to be formatted as WIDTHxHEIGHT, e.g. 640x480.', size);
  }

  return parsedSize;
};

module.exports = Browsertime;
