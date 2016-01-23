'use strict';

let BmpDelegate = require('./bmpDelegate'),
  ChromeDelegate = require('./chromeDelegate'),
  FirefoxDelegate = require('./firefoxDelegate'),
  nullDelegate = require('./nullDelegate'),
  trafficShapeParser = require('../../support/traffic_shape_parser');

module.exports = {
  createDelegate(options){
    this.trafficShapeConfig = trafficShapeParser.parseTrafficShapeConfig(options);
    this.createHar = !options.skipHar;

    if (options.experimental.nativeHar) {
      if (options.browser === 'firefox')
        return new FirefoxDelegate(options);
      if (options.browser === 'chrome')
        return new ChromeDelegate(options);
    }

    if (this.trafficShapeConfig || options.basicAuth || this.createHar) {
      return new BmpDelegate(options);
    }
    return nullDelegate;
  }
};
