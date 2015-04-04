/**
 * Browsertime (http://www.browsertime.net)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var webdriver = require('selenium-webdriver'),
  ie = require('selenium-webdriver/ie'),
  proxy = require('selenium-webdriver/proxy');

var externalProxy;

module.exports.setProxy = function(p) {
  externalProxy = p;
};

module.exports.getDriver = function(arg) {

  var options = new ie.Options();

  options.usePerProcessProxy(true);
  options.ensureCleanSession(true);
  options.ignoreZoomSetting(true);

  var cap = options.toCapabilities();

  var proxyUrl = externalProxy.getProxyUrl();
  if (proxyUrl) {
    cap.setProxy(proxy.manual({ http: proxyUrl, https: proxyUrl }));
  }

  return arg.seleniumServer ? new webdriver.Builder().usingServer(arg.seleniumServer).withCapabilities(cap).build() :
    new webdriver.Builder().withCapabilities(cap).build();
};
