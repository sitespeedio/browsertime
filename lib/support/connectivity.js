'use strict';

const trafficShapeParser = require('./trafficShapeParser'),
  get = require('lodash.get'),
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
  };
}

class TSProxyLauncher {
  constructor(options) {
    this.logVerbose = options.verbose >= 2;
    this.port = get(options.connectivity, 'tsproxy.port');
    this.bind = get(options.connectivity, 'tsproxy.bind');
  }

  start(profile) {
    const scriptArgs = [
      SCRIPT_PATH,
      '--rtt',
      profile.latency,
      '--inkbps',
      profile.downstreamKbps,
      '--outkbps',
      profile.upstreamKbps
    ];

    if (this.bind) {
      scriptArgs.push('--bind', this.bind);
    }

    if (isFinite(this.port)) {
      scriptArgs.push('-p', this.port);
    }

    if (this.logVerbose) {
      scriptArgs.push('-vvvv');
    }

    log.info('Start tsproxy:' + scriptArgs.join(' '));
    this.tsProxyProcess = execa('python', scriptArgs);

    const tsProxyProcess = this.tsProxyProcess;

    if (this.logVerbose) {
      tsProxyProcess.stderr.on('data', function(data) {
        log.verbose(data.toString().trim());
      });
    }

    return new Promise(function(resolve, reject) {
      tsProxyProcess.stdout.on(
        'data',
        getStartupCriteriaListener(resolve, reject)
      );
    });
  }

  stop() {
    if (this.tsProxyProcess) {
      this.tsProxyProcess.stdout.removeAllListeners('data');
      this.tsProxyProcess.stderr.removeAllListeners('data');

      return new Promise((resolve, reject) => {
        this.tsProxyProcess
          .once('exit', () => {
            // guard against exit event sent after error event,
            // see https://nodejs.org/api/child_process.html#child_process_event_error
            if (this.tsProxyProcess) {
              this.tsProxyProcess = null;
              log.debug('Closing TSproxy');
              resolve();
            }
          })
          .once('error', err => {
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
  set(options) {
    const profile = trafficShapeParser.parseTrafficShapeConfig(options);
    if (!profile) {
      return;
    }

    const connectivity = options.connectivity;
    switch (connectivity.engine) {
      case 'tc': {
        const device = get(connectivity.tc, 'device', 'eth0');
        // SLTC only support setting same up/down to work in Docker
        return Promise.resolve(
          sltc({
            device,
            bandwidth: profile.downstreamKbps + 'kbps',
            latency: profile.latency + 'ms',
            pl: '0%'
          })
        );
      }
      case 'tsproxy': {
        this.TSProxyLauncher = new TSProxyLauncher(options);
        return this.TSProxyLauncher.start(profile);
      }
      case 'external': {
        return;
      }
    }
  },
  remove(options) {
    const profile = trafficShapeParser.parseTrafficShapeConfig(options);
    if (!profile) {
      return;
    }

    const connectivity = options.connectivity;
    switch (connectivity.engine) {
      case 'tc': {
        const device = get(connectivity.tc, 'device', 'eth0');
        return Promise.resolve(
          sltc({
            device,
            remove: true
          })
        );
      }
      case 'tsproxy': {
        return this.TSProxyLauncher.stop();
      }
      case 'external': {
        return;
      }
    }
  }
};
