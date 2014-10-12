/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var webdriver = require('selenium-webdriver');

exports.getDriver = function(arg) {

  var cap = webdriver.Capabilities.phantomjs();

  // TODO how to set user agent etc
  return new webdriver.Builder()
    .withCapabilities(cap)
    .build();
};