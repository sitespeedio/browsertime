/**
 * Browsertime (http://www.browsertime.net)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var spawn = require('cross-spawn'),
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    MobProxy = require('browsermob-proxy-api'),
    logger = require('../logger'),
    getport = require('getport');

function Proxy(config) {
  this.port = config.port;
  this.proxyPort = config.proxyPort;
  this.domain = config.domain;
  if (config.basicAuth) {
    var basicAuth = config.basicAuth.split(':');
    this.basicAuth = {};
    this.basicAuth.username = basicAuth[0];
    this.basicAuth.password = basicAuth[1];
  }
  this.headers = config.headers;
  this.limit = config.limit;
  this.proxySleepBeforeStart = config.proxySleepBeforeStart;

  this.log = logger.getLog();
  this.proxyLog = logger.addLog('browsermobproxy', { 'silent': true, 'logDir': config.logDir });
}

Proxy.prototype.launchProcess = function(cb) {
  var self = this;

  async.waterfall([
        function(callback) {
          if (self.port) {
            return callback(null, self.port);
          }
          return getport(callback);
        },
        function(port, callback) {
          if (self.proxyPort) {
            return callback(null, port, self.proxyPort);
          }
          // must start above self.port, since it's still free for getport to pick
          return getport(port + 1, function(e, p) {
            if (e) {
              return callback(e);
            }
            return callback(null, port, p);
          });
        }
      ],
      function(e, port, proxyPort) {
        if (e) {
          return cb(e);
        }
        self.port = port;
        self.proxyPort = proxyPort;

        return self._doLaunch(cb);
      });
  };

Proxy.prototype._doLaunch = function(cb) {
  function tailStdOutForSuccess(data) {
    if (data.toString().indexOf('Started SelectChannelConnector') > -1) {
      removeStartupLogListeners();
      clearTimeout(timeout);

      cb();
    }
  }

  function tailStdErrForFailure(data) {
    var logLine = data.toString();
    if (logLine.indexOf('Started SelectChannelConnector') > -1) {
      removeStartupLogListeners();
      clearTimeout(timeout);

      cb();
    } else if (logLine.indexOf('FAILED ') > -1) {
      removeStartupLogListeners();
      clearTimeout(timeout);

      cb(new Error('proxy failed to start: ' + logLine));
    }
  }

  function endWithTimeout() {
    removeStartupLogListeners();

    cb(new Error('timeout, waited ' + self.proxySleepBeforeStart + ' milliseconds, and proxy didn\'t start'));
  }

  function removeStartupLogListeners() {
    java.stdout.removeListener('data', tailStdOutForSuccess);
    java.stderr.removeListener('data', tailStdErrForFailure);
  }

  this.log.info('Starting proxy on port ' + this.proxyPort +
  ', will wait at most ' + this.proxySleepBeforeStart + ' ms');

  var jarPath = path.join(__dirname, 'bmpwrapper-2.0.0-full.jar');
  this.java = spawn('java', ['-jar', jarPath, '-port', this.proxyPort]);
  var java = this.java;

  var timeout = setTimeout(endWithTimeout, this.proxySleepBeforeStart);

  java.stdout.on('data', function(data) {
    self.proxyLog.info('stdout:' + data);
  }).on('data', tailStdOutForSuccess);

  java.stderr.on('data', function(data) {
    self.proxyLog.error('stderr:' + data);
  }).on('data', tailStdErrForFailure);

  // yep must be better way to make sure that the proxy always
  // is shutdown but leave it like this for now.
  var self = this;
  process.on('uncaughtException', function(err) {
    // console.log(err.stack);
    self.proxyLog.error(err.stack);
    self.log.error('Catched an uncaught exception:' + err + err.stack);
    self.stopProcess(function() {
      process.exit(1);
    });
  });
};

Proxy.prototype.stopProcess = function(cb) {
  this.log.info('Stopping proxy');

  var java = this.java;
  java.removeAllListeners();

  // special handling for Windows
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', java.pid, '/f', '/t']);
  } else {
    var killed = java.kill();
    if (!killed) {
      this.proxyLog.error('Failed to stop proxy process.');
    } else {
      this.proxyLog.info('Stopped proxy process.');
    }
  }
  return cb();
};

Proxy.prototype.openProxy = function(cb) {
  var p = this.proxy = new MobProxy({
    'host': 'localhost',
    'port': this.proxyPort
  });

  var self = this;

  var proxySetupTasks = [];
  if (this.headers) {
    proxySetupTasks.push(function(callback) {
      p.setHeaders(self.port, JSON.stringify(self.headers), callback);
    });
  }
  if (this.basicAuth) {
    proxySetupTasks.push(function(callback) {
      p.setAuthentication(self.port, self.domain, JSON.stringify(self.basicAuth), callback);
    });
  }
  if (this.limit) {
    proxySetupTasks.push(function(callback) {
      p.limit(self.port, self.limit, callback);
    });
  }
  proxySetupTasks.push(function(callback) {
    p.createHAR(self.port, {'captureHeaders': true}, callback);
  });

  p.startPort(self.port, function(err, data) {
    if (err) {
      cb(err);
    } else {
      async.series(proxySetupTasks, cb);
    }
  });
};

Proxy.prototype.closeProxy = function(cb) {
  this.proxy.stopPort(this.port, cb);
};

Proxy.prototype.clearDNS = function(cb) {
  this.proxy.clearDNSCache(this.port, cb);
};

Proxy.prototype.newPage = function(name, cb) {
  this.proxy.startNewPage(this.port, name, cb);
};

Proxy.prototype.saveHar = function(filename, result, cb) {
  this.proxy.getHAR(this.port, function(err, har) {
    if (err) {
      return cb(err);
    }

    var theHar;
    try {
      theHar = JSON.parse(har);
    } catch (err) {
      return cb(err);
    }

    theHar.log.creator.name = 'Browsertime';
    theHar.log.creator.version = '1.0';
    theHar.log.creator.comment = 'Created using BrowserMob Proxy';

    // TODO this is a hack and need to be cleaned up in the future
    for (var i = 0; i < theHar.log.pages.length; i++) {
      theHar.log.pages[i].comment = result.url;
      if (result.default.data[i]) {
        theHar.log.pages[i].title = result.default.data[i].documentTitle;
        theHar.log.pages[i].pageTimings.onContentLoad = result.default.data[i].timings.domContentLoadedTime;
        theHar.log.pages[i].pageTimings.onLoad = result.default.data[i].timings.pageLoadTime;
        Object.keys(result.default.data[i].timings).forEach(function(timing) {
          theHar.log.pages[i]['_' + timing] = result.default.data[i].timings[timing];
        });

        theHar.log.pages[i]._speedIndex = result.default.data[i].speedIndex;
        theHar.log.pages[i]._firstPaint = result.default.data[i].firstPaint;
      }
    }
    fs.writeFile(filename, JSON.stringify(theHar), function(e) {
      return cb(e);
    });
  });
};

Proxy.prototype.getProxyUrl = function() {
  return 'localhost:' + this.port;
};

module.exports = Proxy;
