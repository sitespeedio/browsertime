'use strict';

const http = require('http');
const https = require('https');
const get = require('lodash.get');
const log = require('intel').getLogger('browsertime.connectivity.humble');

class Humble {
  constructor(options) {
    this.url = get(options.connectivity, 'humble.url');
    this.profile = options.connectivity.profile;
  }

  async start(profile) {
    const lib = this.url.startsWith('https') ? https : http;
    const res = await new Promise(resolve => {
      if (this.profile !== 'custom') {
        lib.get(`${this.url}/api/${this.profile}`, resolve);
      } else {
        lib.get(
          `${this.url}/api/custom?up=${profile.up}&down=${profile.down}&rtt=${profile.rtt}`,
          resolve
        );
      }
    });

    let data = await new Promise((resolve, reject) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('error', err => reject(err));
      res.on('end', () => resolve(data));
    });

    if (res.statusCode !== 200) {
      log.error('Humble response: %s', data);
    } else {
      log.info('Switch Humble at %s to use profile %s', this.url, this.profile);
    }
  }

  async stop() {
    const lib = this.url.startsWith('https') ? https : http;
    const res = await new Promise(resolve => {
      lib.get(`${this.url}/api/stop`, resolve);
    });

    let data = await new Promise((resolve, reject) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('error', err => reject(err));
      res.on('end', () => resolve(data));
    });

    if (res.statusCode !== 200) {
      log.error('Humble response: %s', data);
    } else {
      log.info('Humble throttling stopped successfully');
    }
  }
}

module.exports = Humble;
