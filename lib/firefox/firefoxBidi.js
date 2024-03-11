import { Bidi } from '../core/engine/command/bidi.js';
import intel from 'intel';
const log = intel.getLogger('browsertime.firefox.bidi');

export class FirefoxBidi {
  constructor(bidi, browsingContextId, driver, options) {
    this.options = options;
    this.bidi = bidi;
    this.driver = driver;
    this.browsingContextId = browsingContextId;
  }

  async injectJavaScript(script) {
    const params = {
      method: 'script.addPreloadScript',
      params: {
        functionDeclaration: script
      }
    };

    try {
      await this.bidi.send(params);
    } catch (error) {
      log.error('Could not inject JavaScript:' + error);
    }
  }

  async setBasicAuth(basicAuth) {
    const parts = basicAuth.split('@');
    const bidi = new Bidi(this.driver, this.options.browser);

    const command = {
      method: 'network.addIntercept',
      params: {
        phases: ['authRequired']
      }
    };
    await bidi.send(command);

    await bidi.subscribe('network.authRequired');

    await bidi.onMessage(async function (event) {
      const parsedEvent = JSON.parse(Buffer.from(event.toString()));
      if (parsedEvent.method === 'network.authRequired') {
        const continueWithAuth = {
          method: 'network.continueWithAuth',
          params: {
            request: parsedEvent.params.request.request,
            action: 'provideCredentials',
            credentials: {
              type: 'password',
              username: parts[0],
              password: parts[1]
            }
          }
        };
        await bidi.send(continueWithAuth);
      }
    });
  }
}
