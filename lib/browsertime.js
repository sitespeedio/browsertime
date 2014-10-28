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
  log = require('winston'),
  url = require('url');

function Browsertime() {
  this.result = [];
  this.scripts = [];
  this.browserVersion = '';
  this.os = '';
  this.browserName = '';
  this.userAgent = '';
}

Browsertime.prototype.fetch = function(options, cb) {

  cb = cb || function() {};

  this._setupDefault(options);
  this._populateScripts(options);

  log.clear();
  log.add(log.transports.File, {
    filename: 'browsertime.log',
    level: 'info',
    json: false
  });

  // we only write to the console if we don't use silent
  if (!options.silent) {
    log.add(log.transports.Console, {
      level: 'info'
    });
  }

  var work = [];
  var self = this;

  if (options.useProxy === true) {
    // setup the mob proxy
    var mobProxy = new MobProxy({
      port: 10800, // make configurable
      domain: url.parse(options.url).hostname,
      headers: options.headers,
      basicAuth: options.basicAuth,
      limit: options.connectionRaw,
      proxySleepBeforeStart: options.proxySleepBeforeStart
    });

    log.log('info', 'Start the proxy, will wait ' + options.proxySleepBeforeStart + ' ms');
    mobProxy.start(function() {
      self._do(work, mobProxy, options, cb);
    });
  }
  // if we don't use the proxy
  else {
    self._do(work, undefined, options, cb);
  }
};

Browsertime.prototype._do = function(work, mobProxy, options, cb) {
  var self = this;
  for (var i = 0; i < options.runs; i++) {
    work.push(self._collectFromTheBrowser(mobProxy, options));
  }

  async.series(work,
    function(err, results) {
      var data = self._getFormattedResult(options);
      self._saveToFile(data, options, mobProxy, cb);
    });
};


Browsertime.prototype._collectFromTheBrowser = function(mobProxy, options) {
  var self = this;

  return function(callback) {
    async.series([

        function(callback) {
          if (options.useProxy === true) {
            mobProxy.newPage('myname', callback);
          } else {
            callback();
          }
        },
        function(callback) {
          if (options.useProxy === true) {
            mobProxy.clearDNS(callback);
          } else {
            callback();
          }
        }
      ],
      function(err, results) {
        var driver = require(path.join(__dirname, 'browsers', path.sep, options.browser)).getDriver(options);

        driver.getCapabilities().then(function(cap) {
          self.browserVersion = cap.get('version');
          self.os = cap.get('platform');
          self.browserName = cap.get('browserName');
        });

        // fetch the URL and wait until the load event ends or we get the time out
        log.log('info', 'Fetch ' + options.url);
        driver.get(options.url);
        driver.wait(function() {
          return driver.executeScript('return window.performance.timing.loadEventEnd>0').then(function(
            fetched) {
            return fetched;
          });
        }, 60000);

        // lets run all scripts
        var promises = [];
        self.scripts.forEach(function(script) {
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
            var eachRun = {};
            results.forEach(function(metric) {
              Object.keys(metric).forEach(function(key) {
                eachRun[key] = metric[key];
              });
            });
            self.result.push(eachRun);
            driver.quit();
            callback();
          });
      });
  };
};

Browsertime.prototype._getFormattedResult = function(options) {
  var self = this;
  // fetch timings for each run and make some statistics
  var timings = {};
  self.result.forEach(function(run) {
    self._setupTimingsStatistics(timings, run);
    self._setupStatistics(timings, run, 'speedIndex');
    self._setupStatistics(timings, run, 'firstPaint');
    self._setupUserTimingsStatistics(timings, run);
  });
  return {
    url: options.url,
    runs: options.runs,
    browserName: this.browserName,
    browserVersion: this.browserVersion,
    platform: this.os,
    userAgent: this.userAgent,
    windowSize: 'unknown',
    browserTimeVersion: require('../package.json').version,
    statistics: self._formatStatistics(timings),
    data: self.result
  };
};

Browsertime.prototype._saveToFile = function(data, options, mobProxy, cb) {

  // lets store the files
  async.parallel([

      function(callback) {
        fs.writeFile(options.filename, JSON.stringify(data), function(err) {
          callback(err);
        });
      },
      function(callback) {
        if (options.useProxy === true) {
          mobProxy.saveHar(options.harFile, data, function() {
            log.log('info', 'Stop the proxy');
            mobProxy.stop(callback);
          });
        } else {
          callback();
        }
      }
    ],
    // optional callback
    function(err, results) {
      log.log('info', 'Stored ' + options.filename + ' and ' + options.harFile);
      cb();
    });
};

Browsertime.prototype._setupTimingsStatistics = function(timings, metric) {
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

Browsertime.prototype._setupUserTimingsStatistics = function(timings, metric) {
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

Browsertime.prototype._setupStatistics = function(timings, metric, name) {
  if (metric[name]) {
    if (timings[name]) {
      timings[name].push(metric[name]);
    } else {
      timings[name] = new Stats().push(metric[name]);
    }
  }
};

Browsertime.prototype._setupDefault = function(options) {

  options.runs = options.runs || 3;
  options.filename = options.filename || path.join(__dirname, url.parse(options.url).hostname + '.json');
  options.harFile = options.harFile || path.join(__dirname, url.parse(options.url).hostname + '.har');
  options.proxySleepBeforeStart = options.proxySleepBeforeStart || 3000;

  // always use the bmp for now
  options.proxy = 'localhost:10800';

  // TODO cleanup
  if (!options.useProxy) {
    options.useProxy = true;
  } else {
    options.useProxy = options.useProxy === 'true' ? true : false;
  }

  if (options.connection) {
    if (options.connection === 'mobile3g') {
      options.connectionRaw = {
        downstreamKbps: 1600,
        upstreamKbps: 768,
        latency: 300
      };
    } else if (options.connection === 'mobile3gfast') {
      options.connectionRaw = {
        downstreamKbps: 1600,
        upstreamKbps: 768,
        latency: 150
      };
    } else if (options.connection === 'cable') {
      options.connectionRaw = {
        downstreamKbps: 5000,
        upstreamKbps: 1000,
        latency: 28
      };
    }
  }
};

Browsertime.prototype._populateScripts = function(options) {
  this.scripts = [];
  var self = this;
  // read all the scripts
  var rootPath = path.join(__dirname, 'scripts', path.sep);
  fs.readdirSync(rootPath).forEach(function(file) {
    self.scripts.push(require(rootPath + file));
  });

  // get scripts from your own configured script dir
  if (options.scriptPath) {
    var p = path.resolve(options.scriptPath);

    fs.readdirSync(p).forEach(function(file) {
      self.scripts.push(require(p + path.sep + file));
    });
  }
};

Browsertime.prototype._formatStatistics = function(timings) {
  var data = [];

  Object.keys(timings).forEach(function(timing) {
    var stats = timings[timing];
    var decimals = 0;
    data.push({
      name: timing,
      min: stats.percentile(0).toFixed(decimals),
      max: stats.percentile(100).toFixed(decimals),
      p10: stats.percentile(10).toFixed(decimals),
      p70: stats.percentile(70).toFixed(decimals),
      p80: stats.percentile(80).toFixed(decimals),
      p90: stats.percentile(90).toFixed(decimals),
      p99: stats.percentile(99).toFixed(decimals),
      median: stats.median().toFixed(decimals),
      mean: stats.amean().toFixed(decimals)
    });
  });

  return data;
};



module.exports = Browsertime;