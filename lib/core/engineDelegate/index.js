'use strict';

let BmpDelegate = require('./bmpDelegate'),
  nullDelegate = require('./nullDelegate'),
  trafficShapeParser = require('../../support/traffic_shape_parser');

module.exports = {
  createDelegate(options){
    this.trafficShapeConfig = trafficShapeParser.parseTrafficShapeConfig(options);
    this.createHar = !options.skipHar;

    if (this.trafficShapeConfig || options.basicAuth || this.createHar) {
      return new BmpDelegate(options);
    }
    return nullDelegate;
  }
};
