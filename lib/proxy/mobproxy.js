var spawn = require('cross-spawn'),
  path = require('path'),
  fs = require('fs'),
  async = require('async'),
  winston = require('winston'),
  MobProxy = require('browsermob-proxy-api');

function Proxy(config) {
  this.port = config.port;
  this.proxyPort = config.proxyPort;
  this.domain = config.domain;
  this.basicAuth = config.basicAuth;
  this.headers = config.headers;
  this.limit = config.limit;
  // how many runs have we done
  this.run = 0;
  this.proxySleepBeforeStart = config.proxySleepBeforeStart;
  this.proxyLog = new(winston.Logger)({
    transports: [
      new(winston.transports.File)({
        filename: 'browsermobproxy.log'
      })
    ]
  });
  this.log = winston;
}

Proxy.prototype.start = function(cb) {
  var self = this;
  this.log.info('Starting proxy on port ' + this.proxyPort + ', will wait ' + this.proxySleepBeforeStart + ' ms');

  this.java = spawn('java', ['-jar', path.join(__dirname, '../bmpwrapper-0.0.1-SNAPSHOT-full.jar'), '-port', this.proxyPort]);

  this.java.stdout.on('data', function(data) {
    self.proxyLog.info('stdout:' + data);
  });

  this.java.stderr.on('data', function(data) {
    self.proxyLog.info('stderr:' + data);

  });

  // yep must be better way to make sure that the proxy always
  // is shutdown but leave it like this for now.
  process.on('uncaughtException', function(err) {
    console.log(err.stack);
    self.proxyLog.error(err.stack);
    if (!self.isStopped) {
      self.stop(function() {});
      self.isStopped = true;
    } else {}
  });

  setTimeout(function() {
    self.proxy = new MobProxy({
      'host': 'localhost',
      'port': self.proxyPort
    });

    // set the things we need from the proxy
    self.proxy.startPort(self.port, function(err, data) {
      async.series([

          function(callback) {
            if (self.headers) {
              self.proxy.setHeaders(self.port, JSON.stringify(self.headers), callback);
            } else {
              callback();
            }
          },
          function(callback) {
            self.proxy.createHAR(self.port, {
              'captureHeaders': true
            }, callback);
          },
          function(callback) {
            if (self.basicAuth) {
              self.proxy.setAuthentication(self.port, self.domain, JSON.stringify(self.basicAuth), callback);
            } else {
              callback();
            }
          },
          function(callback) {
            if (self.limit) {
              self.proxy.limit(self.port, self.limit, callback);
            } else {
              callback();
            }

          }
        ],
        function(err, results) {
          cb();
        });
    });
    // we wait X seconds so the proxy started (yep it's Java)
  }, this.proxySleepBeforeStart);
};

Proxy.prototype.clearDNS = function(cb) {
  this.proxy.clearDNSCache(this.port);
  cb();
};

Proxy.prototype.newPage = function(name, cb) {
  this.run++;
  if (this.run > 1) {
    this.proxy.startNewPage(this.port, name + this.run, cb);
  } else {
    cb();
  }
};

Proxy.prototype.stop = function(cb) {
  // close the proxy
  var self = this;
  if (this.proxy) {
    this.log.info('Stopping proxy');
    this.proxy.stopPort(this.port, function() {
      try {
        self.java.kill('SIGHUP');
      } catch (error) {
        self.proxyLog.error(error);
      }
      cb();
    });
  }
};

Proxy.prototype.supportsHar = function() {
  return true;
};

Proxy.prototype.saveHar = function(filename, data, cb) {
  this.proxy.getHAR(this.port, function(err, har) {
    var theHar = JSON.parse(har);

    theHar.log.creator.name = 'Browsertime';
    theHar.log.creator.version = '1.0';
    theHar.log.creator.comment = 'Created using BrowserMob Proxy';

    // TODO this is a hack and need to be cleaned up in the future
    for (var i = 0; i < theHar.log.pages.length; i++) {
      theHar.log.pages[i].comment = data.url;
      theHar.log.pages[i].title = data.url + '_' + i; // get the title in the future
      theHar.log.pages[i].pageTimings.onContentLoad = data.data[i].timings.domContentLoadedTime;
      theHar.log.pages[i].pageTimings.onLoad = data.data[i].timings.pageLoadTime;
    }
    fs.writeFile(filename, JSON.stringify(theHar), function(err) {
      if (err) {
        throw err;
      }
      cb();
    });
  });
};

Proxy.prototype.getProxyUrl = function() {
  return 'localhost:' + this.port;
};

module.exports = Proxy;
