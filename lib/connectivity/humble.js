import http from 'node:http';
import https from 'node:https';
import get from 'lodash.get';
import intel from 'intel';
const log = intel.getLogger('browsertime.connectivity.humble');

class Humble {
  constructor(options) {
    this.url = get(options.connectivity, 'humble.url');
    this.profile = options.connectivity.profile;
  }

  async start(profile) {
    const library = this.url.startsWith('https') ? https : http;
    const res = await new Promise(resolve => {
      if (this.profile !== 'custom') {
        library.get(`${this.url}/api/${this.profile}`, resolve);
      } else {
        library.get(
          `${this.url}/api/custom?up=${profile.up}&down=${profile.down}&rtt=${profile.rtt}`,
          resolve
        );
      }
    });

    let data = await new Promise((resolve, reject) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('error', error => reject(error));
      res.on('end', () => resolve(data));
    });

    if (res.statusCode !== 200) {
      log.error('Humble response: %s', data);
    } else {
      log.info('Switch Humble at %s to use profile %s', this.url, this.profile);
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

    if (res.statusCode !== 200) {
      log.error('Humble response: %s', data);
    } else {
      log.info('Humble throttling stopped successfully');
    }
  }
}

export default Humble;
