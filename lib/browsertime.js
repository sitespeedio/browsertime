/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var stats = require('./statistics'),
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

  this._setupDefaults(options);
  this._populateScripts(options);
  this._setupLogging(options);

  var work = [];
  var self = this;

  if (options.useProxy === true) {
    // setup the mob proxy
    var mobProxy = new MobProxy({
      port: options.mobProxyPort, // make configurable
      proxyPort: options.proxyPort,
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
  // fetch timings for each run and make some statistics
  var timings = {};
  this.result.forEach(function(run) {
    stats.setupTimingsStatistics(timings, run);
    stats.setupStatistics(timings, run, 'speedIndex');
    stats.setupStatistics(timings, run, 'firstPaint');
    stats.setupUserTimingsStatistics(timings, run);
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
    statistics: stats.formatStatistics(timings),
    data: this.result
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
      var message = 'Stored ' + options.filename;
      if (options.useProxy === true) {
        message += ' and ' + options.harFile;
      }
      log.log('info', message);
      cb();
    });
};

Browsertime.prototype._setupDefaults = function(options) {

  options.runs = options.runs || 3;
  options.filename = options.filename || path.join(process.cwd(), url.parse(options.url).hostname + '.json');
  options.harFile = options.harFile || path.join(process.cwd(), url.parse(options.url).hostname + '.har');
  options.proxySleepBeforeStart = options.proxySleepBeforeStart || 3000;

  options.mobProxyPort = options.mobProxyPort ||  10800;
  options.proxyPort = options.proxyPort ||  9093;
  // always use the bmp for now
  options.proxy = 'localhost:' + options.mobProxyPort;

  options.seleniumServer = options.seleniumServer || 'http://localhost:4444/wd/hub';

  // TODO cleanup
  if (!options.useProxy) {
    options.useProxy = true;
  } else {
    options.useProxy = options.useProxy === 'true';
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

Browsertime.prototype._setupLogging = function(options) {
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
};

Browsertime.prototype._populateScripts = function(options) {
  var scriptRoots = [path.join(__dirname, 'scripts')];
  if (options.scriptPath) {
    scriptRoots.push(path.resolve(options.scriptPath));
  }

  var self = this;

  scriptRoots.forEach(function(rootPath) {
    fs.readdirSync(rootPath).forEach(function(file) {
      self.scripts.push(require(path.join(rootPath, file)));
    });
  });
};

module.exports = Browsertime;
