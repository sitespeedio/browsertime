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
  url = require('url'),
  validBrowsers = ['chrome', 'firefox', 'phantomjs'];

function Browsertime() {
  this.result = [];
  this.scripts = [];
}

function help() {
  console.log(' -u the URL to test');
  console.log(' -f base file name');
  console.log(' -b the browser to use, use one of the following:' + validBrowsers);
  console.log(' -n the number of runs [3]');
  console.log(' --userAgent the user agent String');
  console.log(' -w the screensize wXh');
  console.log(' --scriptPath the path to an alternative script folder');
  console.log(' --headers request headers {name:value,name2:value2}');
  console.log(' --basicAuth {username:$NAME, password:$password}');
  console.log(' --useProxy use MobProxy or not');
  console.log(' --limit the speed: {downstreamKbps: $X, upstreamKbps: $Y, latency: $Z}')
}

Browsertime.prototype.fetch = function(options, cb) {

  cb = cb || function() {};

  this._checkInput(options);
  this._populateScripts(options);

  var work = [];
  var self = this;

  if (options.useProxy) {
    // setup the mob proxy
    var mobProxy = new MobProxy({
      port: 10800,
      domain: url.parse(options.url).hostname,
      headers: options.headers,
      basicAuth: options.basicAuth,
      limit: options.limit
    });

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
      var data = self._getFormattedResult(options, results);
      self._saveToFile(data, options, mobProxy, cb);
    });
};


Browsertime.prototype._collectFromTheBrowser = function(mobProxy, options) {
  var self = this;

  return function(callback) {
    async.series([

        function(callback) {
          if (options.useProxy) {
            mobProxy.newPage('myname', callback);
          } else {
            callback();
          }
        },
        function(callback) {
          if (options.useProxy) {
            mobProxy.clearDNS(callback);
          } else {
            callback();
          }
        }
      ],
      function(err, results) {
        var driver = require(path.join(__dirname, 'browsers', path.sep, options.browser)).getDriver(options);

        // fetch the URL and wait until the load event ends or we get the time out
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
            self.result.push(results);
            driver.quit();
            callback();
          });
      });
  };
};

Browsertime.prototype._getFormattedResult = function(options, results) {
  var self = this;
  // fetch timings for each run and make some statistics
  var timings = {};
  self.result.forEach(function(run) {
    run.forEach(function(metric) {
      self._setupTimingsStatistics(timings, metric);
      self._setupStatistics(timings, metric, 'speedIndex');
      self._setupStatistics(timings, metric, 'firstPaint');
      self._setupUserTimingsStatistics(timings, metric);
    });
  });

  return {
    url: options.url,
    browser: options.browser,
    runs: options.times,
    statistics: self._formatStatistics(timings),
    data: self.result
  };
};

Browsertime.prototype._saveToFile = function(data, options, mobProxy, cb) {

  // lets store the files
  async.parallel([

      function(callback) {
        fs.writeFile(path.join(__dirname, options.filename + '.json'), JSON.stringify(data), function(err) {
          if (err) {
            throw err;
          }
          callback();
        });
      },
      function(callback) {
        if (options.useProxy) {
          mobProxy.saveHar(path.join(__dirname, options.filename + '.har'), data, function() {
            mobProxy.stop(callback);
          });
        } else {
          callback();
        }
      }
    ],
    // optional callback
    function(err, results) {
      console.log('stored the files ...');
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

Browsertime.prototype._checkInput = function(options) {

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
    options.runs = 3;
  }

  if (!options.filename) {
    options.filename = url.parse(options.url).hostname;
  }

  // always use the bmp for now
  options.proxy = 'localhost:10800';

  if (!options.useProxy) {
    options.useProxy = true;
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



module.exports = Browsertime;