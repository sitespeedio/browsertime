/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var webdriver = require('selenium-webdriver'),
  proxy = require('selenium-webdriver/proxy');

exports.getDriver = function(arg) {

  var cap = webdriver.Capabilities.safari();

  if (arg.useProxy) {
    cap.setProxy(proxy.manual({
      http: arg.proxy
    }));
  }

  return new webdriver.Builder().usingServer(arg.seleniumServer).withCapabilities(cap).build();

};
