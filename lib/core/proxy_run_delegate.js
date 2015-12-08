'use strict';

let Promise = require('bluebird'),
  urlParser = require('url'),
  log = require('intel'),
  BmpRunner = require('./bmp_runner'),
  harBuilder = require('../support/har_builder'),
  trafficShapeParser = require('../support/traffic_shape_parser');

class ProxyRunDelegate {
  constructor(options) {
    this.trafficShapeConfig = trafficShapeParser.parseTrafficShapeConfig(options);
    this.createHar = !options.skipHar;

    if (this.trafficShapeConfig || options.basicAuth || this.createHar === true) {
      this.bmpRunner = new BmpRunner();
    }
  }

  __runIfProxy(block) {
    if (this.bmpRunner) {
      return block();
    } else {
      return Promise.resolve()
    }
  }

  onStart() {
    return this.__runIfProxy(() => this.bmpRunner.start());
  }

  onStartRun(options) {
    return this.__runIfProxy(() => {
      this.isFirstPage = true;
      let promise = this.bmpRunner.startProxy()
        .tap(() => {
          let proxyConfigTasks = [];
          if (this.trafficShapeConfig) {
            proxyConfigTasks.push(this.bmpRunner.setLimit(this.trafficShapeConfig));
          }
          const auth = options.basicAuth;
          if (auth) {
            if (!auth.domain) {
              auth.domain = urlParser.parse(url).host;
              log.verbose('Extracting domain %s for basic authentication from url', auth.domain);
            }
            proxyConfigTasks.push(this.bmpRunner.addBasicAuth(auth.domain, auth.username, auth.password));
          }
          return Promise.all(proxyConfigTasks);
        })
        .tap((proxyPort) => {
          options.proxyPort = proxyPort;
        });

      if (this.createHar) {
        promise = promise.then(() => this.bmpRunner.createHAR());
      }

      return promise;

    });
  }

  onStartPage() {
    return this.__runIfProxy(() => {
      let promise = Promise.resolve();

      if (this.createHar && !this.isFirstPage) {
        promise = this.bmpRunner.startNewPage();
      }

      this.isFirstPage = false;

      return promise;
    });
  }

  onStopRun(result) {
    return this.__runIfProxy(() => {
      let promise = Promise.resolve();

      if (this.createHar) {
        promise = promise.then(() => {
          this.bmpRunner.getHAR()
            .then(JSON.parse)
            .then((har) => {
              harBuilder.addCreator(har);
              result.har = har;
              return result;
            });
        });
      }

      return promise.tap(() => this.bmpRunner.stopProxy());
    });
  }

  onStop() {
    return this.__runIfProxy(() => {
      log.debug('Stopping proxy process');
      return this.bmpRunner.stop()
        .tap(() => {
          log.debug('Stopped proxy process');
        });
    });
  }

}

module.exports = ProxyRunDelegate;