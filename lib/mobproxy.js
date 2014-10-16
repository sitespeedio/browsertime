var spawn = require('cross-spawn'),
  path = require('path'),
  sleep = require('sleep'),
  fs = require('fs'),
  async = require('async'),
  MobProxy = require('browsermob-proxy-api');

function Proxy(config) {
  this.port = config.port;
  if (config.basicAuth) {
    this.basicAuth = config.basicAuth;
  }
  if (config.headers) {
    this.headers = config.headers;
  }

}

Proxy.prototype.start = function(cb) {
  // start the browsermob proxy
  this.java = spawn('java', ['-jar', path.join(__dirname, 'bmpwrapper-0.0.1-SNAPSHOT-full.jar'), '-port', '9093']);


  this.java.stdout.on('data', function(data) {
    console.log(data);
  });
  this.java.stderr.on('data', function(data) {
    console.log('e:' + data);
  });

  sleep.sleep(2);

  this.proxy = new MobProxy({
    'host': 'localhost',
    'port': '9093'
  });

  var self = this;
  this.proxy.startPort(this.port, function(err, data) {
    async.series([

        function(callback) {
          self.proxy.createHAR(self.port, {
            'initialPageRef': 'foo',
            'captureHeaders': true
          }, callback);
        }
        /*,
        function(callback) {
          if (self.headers) {
            self.proxy.setHeaders(self.port, JSON.stringify(self.headers), callback);
          } else callback();
        },
        function(callback) {
          if (self.basicAuth) {
            self.proxy.setAuthentication(443, domain, json, callback);
          }
        }*/
      ],
      // optional callback
      function(err, results) {
        cb();
      });
  });
};

Proxy.prototype.newPage = function(name) {
  this.proxy.startNewPage(this.port, name, function() {});
};

Proxy.prototype.stop = function(cb) {
  // close the proxy
  var self = this;
  this.proxy.stopPort(this.port, function() {

    try {
      self.java.kill('SIGHUP');
    } catch (error) {
      console.log(error);
    }
    cb();
  });

};

Proxy.prototype.saveHar = function(filename, cb) {
  this.proxy.getHAR(this.port, function(err, har) {
    // TODO for each page insert the timings

    fs.writeFile(filename, har, function(err) {
      if (err) throw err;
      cb();
    });
  });
};

module.exports = Proxy;