'use strict';

let Promise = require('bluebird'),
  log = require('intel'),
  path = require('path'),
  JarLauncher = require('../support/jar_launcher'),
  MobProxy = require('browsermob-proxy-api'),
  merge = require('lodash.merge'),
  getport = require('getport');

getport = Promise.promisify(getport);
Promise.promisifyAll(MobProxy.prototype);

const defaults = {};

class BmpRunner {
  constructor(options) {
    this.options = merge({}, defaults, options);

    this.jarPath = path.resolve(__dirname, '..', '..', 'vendor', 'bmpwrapper-2.0.0-full.jar');

    this.jarLauncher = new JarLauncher(
      {
        'jarPath': this.jarPath,
        'stdoutLogLevel': log.DEBUG,
        'stderrLogLevel': log.DEBUG,
        'startupCriteria': {
          'success': {
            'stdout': null,
            'stderr': 'Started SelectChannelConnector'
          },
          'failure': {
            'stdout': null,
            'stderr': 'Exception in thread'
          }
        }
      }
    );

  }

  start() {
    return getport()
      .then((port) => {
        this.restPort = port;
        return this.jarLauncher.start(['-port', port]);
      })
      .timeout(10000, this.jarPath + ' hasn\'t started after 10 seconds');
  }

  stop() {
    return this.jarLauncher.stop()
      .timeout(5000, this.jarPath + ' hasn\'t stopped after 5 seconds');
  }

  startProxy() {
    log.debug('starting proxy');

    return getport()
      .tap((port) => {
        this.proxyPort = port;
        this.proxy = new MobProxy({
          'host': 'localhost',
          'port': this.restPort
        });
        return this.proxy.startPortAsync(port);
      });
  }

  stopProxy() {
    log.debug('stopping proxy');
    return this.proxy.stopPortAsync(this.proxyPort);
  }

  setLimit(limit) {
    log.debug('Setting connection limit %:1j', limit);
    return this.proxy.setLimitAsync(this.proxyPort, limit);
  }

  addBasicAuth(domain, username, password) {
    log.debug('Setting basic auth headers for domain %s', domain);
    return this.proxy.setAuthenticationAsync(this.proxyPort, domain, {username, password});
  }

  createHAR(harOptions) {
    const defaultHarOptions = {'captureHeaders': true};
    let options = merge({}, defaultHarOptions, harOptions);
    return this.proxy.createHARAsync(this.proxyPort, options);
  }

  startNewPage(name) {
    return this.proxy.startNewPageAsync(this.proxyPort, name);
  }

  getHAR() {
    return this.proxy.getHARAsync(this.proxyPort);
  }
}
module.exports = BmpRunner;
