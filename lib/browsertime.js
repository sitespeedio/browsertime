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

	// lets store the result in this structure. dynamic data can change
	// between runs, static is the same and will be fetched the first time
	this.result = {
		default: {
			data: []
		},
		custom: {
			data: []
		}
	};
	this.defaultScripts = {};
	this.customScripts = {};
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
				self.log.error(util.inspect(err));
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
					driver.manage().timeouts().pageLoadTimeout(pageLoadTimeout);
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
						self._populatePromises(driver, self.defaultScripts, promises, false);
						self._populatePromises(driver, self.customScripts, promises, true);

						var callbacks = [];
						promises.forEach(function(promise) {
							callbacks.push(function(cb) {
								promise.promise.then(function(value) {
									var result = {
										name: promise.name,
										value: value,
										custom: promise.custom || false
									};
									cb(null, result);
								}, function(e) {
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
								var custom = {};
								var data = {};
								results.forEach(function(metric) {
									if (metric.custom) {
										custom[metric.name] = metric.value;
									} else {
										data[metric.name] = metric.value;
									}
								});
								data.date = new Date(afterFetchTime);
								self.result.default.data.push(data);
								self.result.custom.data.push(custom);

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
	var defaultData = {};
	var custom = {};
	var self = this;

	this.result.default.data.forEach(function(run) {
		Object.keys(self.defaultScripts).forEach(function(scriptName) {
			stats.setupTimingsStatistics(defaultData, run);
			stats.setupUserTimingsStatistics(defaultData, run);
			// for all scripts that return numbers automatically
			// include them in the statistics
			if (helper.isNumber(run[scriptName])) {
				stats.setupStatistics(defaultData, run, scriptName);
			}
		});

		// Ugly hack: Firefox has an extra toJSON method in the resource timings
		// lets skip that for the result
		if (run.resourceTiming) {
			run.resourceTiming.forEach(function(entry) {
				if (entry.toJSON) {
					entry.toJSON = undefined;
				}
			});
		}

	});

	// right now only add the dynamics as statistics
	this.result.custom.data.forEach(function(run) {
		Object.keys(self.customScripts).forEach(function(scriptName) {
			// for all scripts that return numbers automatically
			// include them in the statistics
			if (helper.isNumber(run[scriptName])) {
				stats.setupStatistics(custom, run, scriptName);
			}
		});
	});

	return {
		url: options.url,
		runs: options.runs,
		browserName: this.browserName,
		browserVersion: this.browserVersion,
		platform: this.os,
		browserTimeVersion: require('../package.json').version,
		default: {
			statistics: stats.formatStatistics(defaultData),
			data: this.result.default
		},
		custom: {
			statistics: stats.formatStatistics(custom),
			data: this.result.custom
		}
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
	var scriptRoots = path.join(__dirname, '..', 'scripts');

	if (options.scriptPath) {
		helper.readScripts(path.join(path.resolve(options.scriptPath)), self.customScripts.static, this.log);
	}
	helper.readScripts(scriptRoots, self.defaultScripts, this.log);
};

Browsertime.prototype._populatePromises = function(driver, scripts, promises, isCustom) {
	Object.keys(scripts).forEach(function(scriptName) {
		promises.push({
			name: scriptName,
			promise: driver.executeScript(scripts[scriptName]),
			custom: isCustom
		});
	});
};

module.exports = Browsertime;
