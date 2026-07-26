import { getLogger } from '@sitespeed.io/log';
import { getProperty } from '../support/util.js';

const log = getLogger('browsertime.chrome.network');

export class NetworkManager {
  constructor(cdpClient, options) {
    this.maxTimeout = getProperty(
      options,
      'timeouts.pageCompleteCheck',
      30_000
    );
    this.idleTime = getProperty(options, 'timeouts.networkIdle', 5000);

    this.cdp = cdpClient.getRawClient();
    this.inflight = 0;
    this.lastRequestTimestamp = Date.now();
    this.lastResponseTimestamp = Date.now();

    // Each registration returns an unsubscribe function. Keep them so
    // the listeners can be removed when the wait is over: a new
    // NetworkManager is created per waitForNetworkIdle call and the CDP
    // client lives for the whole browser session.
    this.unsubscribers = [
      this.cdp.Network.requestWillBeSent(() => {
        this.inflight++;
        this.lastRequestTimestamp = Date.now();
      }),

      this.cdp.Network.loadingFinished(() => {
        this.inflight--;
        this.lastResponseTimestamp = Date.now();
      }),

      this.cdp.Network.loadingFailed(() => {
        this.inflight--;
        this.lastResponseTimestamp = Date.now();
      })
    ];
  }

  async waitForNetworkIdle() {
    const startTime = Date.now();

    try {
      while (true) {
        const now = Date.now();
        const sinceLastResponseRequest =
          now - Math.max(this.lastResponseTimestamp, this.lastRequestTimestamp);
        const sinceStart = now - startTime;

        if (sinceLastResponseRequest >= this.idleTime) {
          if (this.inflight > 0) {
            log.info(
              'Idle time without any request/responses. Inflight requests:' +
                this.inflight
            );
          }
          break;
        }

        if (sinceStart >= this.maxTimeout) {
          log.info(
            'Timeout waiting for network.  Inflight requests:' + this.inflight
          );
          break;
        }

        await new Promise(r => setTimeout(r, 200));
      }
    } finally {
      for (const unsubscribe of this.unsubscribers) {
        unsubscribe();
      }
    }
  }
}
