'use strict';

let Promise = require('bluebird'),
  urlParser = require('url'),
  log = require('intel'),
  BmpRunner = require('./../bmp_runner'),
  harBuilder = require('../../support/har_builder'),
  trafficShapeParser = require('../../support/traffic_shape_parser');

class BmpDelegate {
  constructor(options) {
    this.trafficShapeConfig = trafficShapeParser.parseTrafficShapeConfig(options);
    this.createHar = !options.skipHar;

    if (!(this.trafficShapeConfig || options.basicAuth || this.createHar)) {
      throw new Error('BmpDelegate incorrect options: ' + JSON.stringify(options, null, 2));
    }

    this.bmpRunner = new BmpRunner(options);
  }

  onStart() {
    return this.bmpRunner.start();
  }

  onStartRun(url, options) {
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
      this.isFirstPage = true;
      promise = promise.then(() => this.bmpRunner.createHAR());
    }

    return promise;
  }

  onStartIteration() {
    let promise = Promise.resolve();

    if (this.createHar && !this.isFirstPage) {
      promise = this.bmpRunner.startNewPage();
    }
    this.isFirstPage = false;

    return promise;
  }

  onStopIteration() {
    return Promise.resolve();
  }

  onStopRun(result) {
    let promise;

    if (this.createHar) {
      promise = this.bmpRunner.getHAR()
        .then(JSON.parse)
        .then((har) => {
          result.har = harBuilder.addCreator(har);
          return result;
        });
    }

    return Promise.resolve(promise).tap(() => this.bmpRunner.stopProxy());
  }

  onStop() {
    log.debug('Stopping proxy process');
    return this.bmpRunner.stop()
      .tap(() => {
        log.debug('Stopped proxy process');
      });
  }
}

module.exports = BmpDelegate;
