/**
 * Browsertime (http://www.browsertime.net)
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
  helper = require('./helper'),
	url = require('url'),
	util = require('util'),
	EventEmitter = require('async-node-events'),
	webdriver = require('selenium-webdriver');

var defaultWaitScript = 'return window.performance.timing.loadEventEnd>0';

function Browsertime(b) {
	this.log = logger.getLog();
	EventEmitter.call(this);
	this.result = [];
	this.scripts = {};
	this.runOnceScripts = {};
	this.staticData = {};
	this.userDefinedScriptNames = [];
	this.userDefinedMetrics = [];
	this.browserVersion = '';
	this.os = '';
	this.browserName = '';
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

					var windowSize = helper.parseWindowSize(options.size, log);
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
								Object.keys(self.scripts).forEach(function(scriptName) {
									promises.push({
										name: scriptName,
										promise: driver.executeScript(self.scripts[scriptName])
									});
								});

								if (iteration === 1) {
									Object.keys(self.runOnceScripts).forEach(function(scriptName) {
										promises.push({
											name: scriptName,
											promise: driver.executeScript(self.runOnceScripts[scriptName]),
											static: true
										});
									});
								}

                var callbacks = [];
                promises.forEach(function(promise) {
                  callbacks.push(function(cb) {
                    promise.promise.then(function(value) {
											if (!promise.static) {
												var result = {};
												result.name = promise.name;
												result.value = value;
												cb(null, result);
											} else {
												var staticResult = {};
		                    staticResult.name = promise.name;
		                    staticResult.value = value;
		                    staticResult.static = true;
												cb(null, staticResult);
											}}, function(e) {
                      log.error('Error running script \'%s\': %s', promise.name, util.inspect(e));
                      cb(e);
                    });
                  });
                });

                // when we are finished, push the result and stop the browser
                async.series(callbacks,
                    function(e, results) {
                      if (e) {
                        return callback(e);
                      }
											var eachRun = {};
											var staticData = {};
											results.forEach(function(metric) {
												if (!metric.static) {
													eachRun[metric.name] = metric.value;
												} else {
													staticData[metric.name] = metric.value;
												}
											});
											eachRun.date = new Date(afterFetchTime);
											self.result.push(eachRun);
											if (iteration === 1) {
												self.staticData = staticData;
											}
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
	var self = this;

	this.result.forEach(function(run) {
		Object.keys(self.scripts).forEach(function(scriptName) {
			stats.setupTimingsStatistics(timings, run);
			stats.setupUserTimingsStatistics(timings, run);
			// for all scripts that return numbers automatically
			// include them in the statistics
			if (helper.isNumber(run[scriptName])) {
				stats.setupStatistics(timings, run, scriptName);
			}
		});

		self.userDefinedScriptNames.forEach(function(scriptName) {
			var metric = {};
      metric[scriptName] = run[scriptName];
      self.userDefinedMetrics.push(metric);
		});

	});

	var data = {
		url: options.url,
		runs: options.runs,
		browserName: this.browserName,
		browserVersion: this.browserVersion,
		platform: this.os,
		browserTimeVersion: require('../package.json').version
	};

	Object.keys(this.staticData).forEach(function(key) {
		data[key] = self.staticData[key];
	});

	data.statistics = stats.formatStatistics(timings);
	if (this.userDefinedMetrics.length>0) {
	 data.userDefinedMetrics = this.userDefinedMetrics;
	}
	data.data = this.result;

	return data;
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
			self.emit('savingResults', {
				data: data
			}, callback);
		}
	], cb);
};

Browsertime.prototype._setupDefaults = function(options) {

	options.runs = options.runs || 3;
	options.filename = options.filename || path.join(process.cwd(), url.parse(options.url).hostname + '.json');
	options.seleniumServer = options.seleniumServer || 'http://localhost:4444/wd/hub';
};

Browsertime.prototype._populateScripts = function(options) {
	var self = this;
	var scriptRoots = [path.join(__dirname, 'scripts', 'metrics')];
	var runOnceScriptRoots = [path.join(__dirname, 'scripts', 'static')];

	if (options.scriptPath) {
		scriptRoots.push(path.resolve(options.scriptPath));

		fs.readdirSync(path.resolve(options.scriptPath)).forEach(function(file) {
			var name = helper.cleanScriptName(path.basename(file, '.js'));
			self.userDefinedScriptNames.push(name);
		});

	}
  helper.readScripts(runOnceScriptRoots, self.runOnceScripts, this.log);
  helper.readScripts(scriptRoots, self.scripts, this.log);
};

module.exports = Browsertime;
