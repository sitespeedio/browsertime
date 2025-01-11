import http from 'node:http';
import https from 'node:https';
import { getLogger } from '@sitespeed.io/log';
import { getProperty } from '../support/util.js';
const log = getLogger('browsertime.connectivity.humble');

export class Humble {
  constructor(options) {
    this.url = getProperty(options.connectivity, 'humble.url');
    this.profile = options.connectivity.profile;
  }

  async start(profile) {
    const library = this.url.startsWith('https') ? https : http;
    const res = await new Promise(resolve => {
      if (this.profile === 'custom') {
        library.get(
          `${this.url}/api/custom?up=${profile.up}&down=${profile.down}&rtt=${profile.rtt}`,
          resolve
        );
      } else {
        library.get(`${this.url}/api/${this.profile}`, resolve);
      }
    });

    let data = await new Promise((resolve, reject) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('error', error => reject(error));
      res.on('end', () => resolve(data));
    });

    if (res.statusCode === 200) {
      log.info('Switch Humble at %s to use profile %s', this.url, this.profile);
    } else {
      log.error('Humble response: %s', data);
    }
  }

  async stop() {
    const library = this.url.startsWith('https') ? https : http;
    const res = await new Promise(resolve => {
      library.get(`${this.url}/api/stop`, resolve);
    });

    let data = await new Promise((resolve, reject) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('error', error => reject(error));
      res.on('end', () => resolve(data));
    });

    if (res.statusCode === 200) {
      log.info('Humble throttling stopped successfully');
    } else {
      log.error('Humble response: %s', data);
    }
  }
}
