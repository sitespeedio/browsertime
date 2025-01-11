import { getLogger } from '@sitespeed.io/log';
import { getProperty } from '../support/util.js';
const log = getLogger('browsertime.chrome.network');

export class NetworkManager {
  constructor(bidi, browsingContextIds, options) {
    this.bidi = bidi;
    this.browsingContextIds = browsingContextIds;
    this.maxTimeout = getProperty(
      options,
      'timeouts.pageCompleteCheck',
      30_000
    );
    this.idleTime = getProperty(options, 'timeouts.networkIdle', 5000);
  }

  async waitForNetworkIdle() {
    await this.bidi.subscribe(
      'network.beforeRequestSent',
      this.browsingContextIds
    );
    await this.bidi.subscribe(
      'network.responseCompleted',
      this.browsingContextIds
    );
    await this.bidi.subscribe('network.fetchError', this.browsingContextIds);

    let inflight = 0;
    let lastRequestTimestamp;
    let lastResponseTimestamp;
    this.ws = await this.bidi.socket;
    this.ws.on('message', function (event) {
      const { method } = JSON.parse(Buffer.from(event.toString()));
      if (method) {
        switch (method) {
          case 'network.beforeRequestSent': {
            inflight++;
            lastRequestTimestamp = Date.now();

            break;
          }
          case 'network.responseCompleted': {
            inflight--;
            lastResponseTimestamp = Date.now();

            break;
          }
          case 'network.fetchError': {
            inflight--;
            lastResponseTimestamp = Date.now();

            break;
          }
          // No default
        }
      }
    });

    const startTime = Date.now();

    while (true) {
      const now = Date.now();
      const sinceLastResponseRequest =
        now - Math.max(lastResponseTimestamp, lastRequestTimestamp);
      const sinceStart = now - startTime;

      if (sinceLastResponseRequest >= this.idleTime) {
        if (inflight > 0) {
          log.info(
            'Idle time without any request/responses. Inflight requests:' +
              inflight
          );
        }
        await this.bidi.unsubscribe(
          'network.beforeRequestSent',
          this.browsingContextIds
        );
        await this.bidi.unsubscribe(
          'network.responseCompleted',
          this.browsingContextIds
        );

        await this.bidi.unsubscribe(
          'network.fetchError',
          this.browsingContextIds
        );

        break;
      }

      if (sinceStart >= this.maxTimeout) {
        log.info(
          'Timeout waiting for network idle. Inflight requests:' + inflight
        );
        await this.bidi.unsubscribe(
          'network.beforeRequestSent',
          this.browsingContextIds
        );
        await this.bidi.unsubscribe(
          'network.responseCompleted',
          this.browsingContextIds
        );
        await this.bidi.unsubscribe(
          'network.fetchError',
          this.browsingContextIds
        );
        break;
      }

      await new Promise(r => setTimeout(r, 200));
    }
  }
}
