'use strict';

const trafficShapeParser = require('./trafficShapeParser'),
  Promise = require('bluebird'),
  execa = require('execa'),
  path = require('path'),
  sltc = require('sltc').sltc,
  log = require('intel');

const SCRIPT_PATH = path.join(__dirname, '..', '..', 'vendor', 'tsproxy.py');

function getStartupCriteriaListener(resolve, reject) {
  return function(data) {
    const logLine = data.toString();
    if (logLine.startsWith('Started Socks5 proxy server on')) {
      log.debug('Started TSproxy');
      return resolve();
    } else if (logLine.startsWith('Unable to listen on')) {
      return reject(new Error('TSProxy process logged: ' + logLine));
    }
  }
}

class TSProxyLauncher {
  constructor(options) {
    this.options = options;
  }

  start(profile) {
    const scriptArgs = [SCRIPT_PATH, '--rtt', profile.latency, '--inkbps', profile.downstreamKbps, '--outkbps', profile.upstreamKbps, '-p', this.options.connectivity.tsproxy.port];

    if (this.options.v >= 2)  {
      scriptArgs.push('-vvvv');
    }

    log.info('Start tsproxy:' + scriptArgs.join(' '));
    this.tsProxyProcess = execa('python', scriptArgs);

    const tsProxyProcess = this.tsProxyProcess;

    if (this.options.v >= 2) {
      tsProxyProcess.stderr.on('data', function(data) {
        log.verbose(data.toString())
      })
    }

    return new Promise(function(resolve, reject) {
      tsProxyProcess.stdout
        .on('data', getStartupCriteriaListener(resolve, reject));
    });

  }

  stop() {
    if (this.tsProxyProcess) {
      this.tsProxyProcess.stdout.removeAllListeners('data');
      this.tsProxyProcess.stderr.removeAllListeners('data');

      return new Promise((resolve, reject) => {
        this.tsProxyProcess.once('exit', () => {
          // guard against exit event sent after error event,
          // see https://nodejs.org/api/child_process.html#child_process_event_error
          if (this.tsProxyProcess) {
            this.tsProxyProcess = null;
            log.debug('Closing TSproxy')
            resolve();
          }
        }).once('error', (err) => {
          this.tsProxyProcess = null;
          reject(err);
        });
        this.tsProxyProcess.kill('SIGINT');
      });
    }
    return Promise.resolve();
  }
}


module.exports = {
  set: function(options) {
    const profile = trafficShapeParser.parseTrafficShapeConfig(options);
    if (profile !== null) {
      if (options.connectivity && options.connectivity.engine && options.connectivity.engine === 'tc') {
      // SLTC only support setting same up/down to work in Docker
      return new Promise(function(resolve) {
      sltc({
          device: options.connectivity.tc.device,
          bandwidth: profile.downstreamKbps + 'kbps',
          latency: profile.latency,
          pl: 0
        });
        resolve();
      });

      } else if (options.connectivity && options.connectivity.engine && options.connectivity.engine === 'tsproxy') {
        this.TSProxyLauncher = new TSProxyLauncher(options);
        return this.TSProxyLauncher.start(profile);
      }
    }
  },
  remove: function(options) {
    if (options.connectivity && options.connectivity.engine && options.connectivity.engine === 'tc') {
      return sltc({
        device: options.connectivity.device,
        remove: true
      });
    } else if (options.connectivity && options.connectivity.engine && options.connectivity.engine === 'tsproxy') {
      return this.TSProxyLauncher.stop();
    }
  }
}
