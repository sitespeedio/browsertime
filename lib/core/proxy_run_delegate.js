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
    this.skipHar = options.skipHar;

    if (this.trafficShapeConfig || this.skipHar !== true) {
      this.bmpRunner = new BmpRunner();
    }
  }

  __wrapInIf(block) {
    if (this.bmpRunner) {
      return block();
    } else {
      return Promise.resolve()
    }
  }

  onStart() {
    return this.__wrapInIf(() => this.bmpRunner.start());
  }

  onStartRun(options) {
    return this.__wrapInIf(() => {
      this.pageIndex = 0;
      return this.bmpRunner.startProxy()
        .tap(() => {
          let proxyConfigTasks = [];
          if (this.trafficShapeConfig) {
            proxyConfigTasks.push(this.bmpRunner.setLimit(trafficShapeConfig));
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
        .tap(function(proxyPort) {
          options.proxyPort = proxyPort;
        });
    });
  }

  onStartPage() {
    return this.__wrapInIf(() => {
      let promise;

      if (this.pageIndex === 0) {
        promise = this.bmpRunner.createHAR();
      } else {
        promise = this.bmpRunner.startNewPage();
      }

      this.pageIndex++;

      return promise;
    });
  }

  onStopRun(result) {
    return this.__wrapInIf(() => {
      let promise;

      if (!this.skipHar) {
        promise = this.bmpRunner.getHAR()
          .then(JSON.parse)
          .tap(function(har) {
            harBuilder.addCreator(har);
            result.har = har;
          });
      }

      return promise.tap(() => this.bmpRunner.stopProxy());
    });
  }

  onStop() {
    return this.__wrapInIf(() => {
      log.debug('Stopping proxy process');
      return this.bmpRunner.stop()
        .tap(function() {
          log.debug('Stopped proxy process');
        });
    });
  }

}

module.exports = ProxyRunDelegate;