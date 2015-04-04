/**
 * Browsertime (http://www.browsertime.net)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var webdriver = require('selenium-webdriver'),
  proxy = require('selenium-webdriver/proxy');

var externalProxy;

module.exports.setProxy = function(p) {
  externalProxy = p;
};

module.exports.getDriver = function(arg) {

  // var options = new safari.Options();
  // I get Error: EPERM on my local
  // options.setCleanSession(true);
  //   var cap = options.toCapabilities();

  var cap = webdriver.Capabilities.safari();

  var proxyUrl = externalProxy.getProxyUrl();
  if (proxyUrl) {
    cap.setProxy(proxy.manual({ http: proxyUrl, https: proxyUrl }));
  }

  return arg.seleniumServer ? new webdriver.Builder().usingServer(arg.seleniumServer).withCapabilities(cap).build() :
    new webdriver.Builder().withCapabilities(cap).build();
};
