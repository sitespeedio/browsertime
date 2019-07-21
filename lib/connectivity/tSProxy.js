'use strict';

const execa = require('execa');
const path = require('path');
const get = require('lodash.get');
const log = require('intel').getLogger('browsertime.connectivity.tsproxy');

const TS_PROXY_SCRIPT_PATH = path.join(
  __dirname,
  '..',
  '..',
  'vendor',
  'tsproxy.py'
);

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

class TSProxy {
  constructor(options) {
    this.logVerbose = options.verbose >= 2;
    this.port = get(options.connectivity, 'tsproxy.port', 1080);
    this.bind = get(options.connectivity, 'tsproxy.bind');
  }

  start(profile) {
    const scriptArgs = [
      TS_PROXY_SCRIPT_PATH,
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

    log.info('Start TSProxy:' + scriptArgs.join(' '));
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

module.exports = TSProxy;
