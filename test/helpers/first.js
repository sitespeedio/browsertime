'use strict';

var Bluebird = require('bluebird'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  intel = require('intel');

intel.basicConfig({
  level: intel.INFO,
  format: '[%(date)s][%(levelname)s] %(message)s'
});

chai.use(chaiAsPromised);

chai.should();

require('longjohn');

Bluebird.config({
  warnings: true,
  longStackTraces: true
});
