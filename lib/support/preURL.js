'use strict';

const Promise = require('bluebird'),
  log = require('intel').getLogger('browsertime');

module.exports = {
  run(context) {
      return context.runWithDriver((driver) => {
          log.info('Accessing preURL %s', context.options.preURL);
          return driver.get(context.options.preURL);
        }).then(() => Promise.delay(1500));
    }
};
