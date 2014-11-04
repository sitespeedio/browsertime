/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var webdriver = require('selenium-webdriver'),
  proxy = require('selenium-webdriver/proxy');

exports.getDriver = function(arg) {

  // TODO how to set user agent etc
  var cap = webdriver.Capabilities.phantomjs();

  if (arg.useProxy) {
    cap.setProxy(proxy.manual({
      http: arg.proxy
    }));
  }

  return new webdriver.Builder().withCapabilities(cap).build();

};
