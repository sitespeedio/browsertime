import intel from 'intel';
import get from 'lodash.get';

const log = intel.getLogger('browsertime.chrome.network');

export class NetworkManager {
  constructor(cdpClient, options) {
    this.maxTimeout = get(options, 'timeouts.pageCompleteCheck', 30_000);
    this.idleTime = get(options, 'timeouts.networkIdle', 5000);

    this.cdp = cdpClient.getRawClient();
    this.inflight = 0;
    this.lastRequestTimestamp;
    this.lastResponseTimestamp;

    this.cdp.Network.requestWillBeSent(() => {
      this.inflight++;
      this.lastRequestTimestamp = Date.now();
    });

    this.cdp.Network.loadingFinished(() => {
      this.inflight--;
      this.lastResponseTimestamp = Date.now();
    });

    this.cdp.Network.loadingFailed(() => {
      this.inflight--;
      this.lastResponseTimestamp = Date.now();
    });
  }

  async waitForNetworkIdle() {
    const startTime = Date.now();
    // eslint-disable-next-line no-constant-condition
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
  }
}
