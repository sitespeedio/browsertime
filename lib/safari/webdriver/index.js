'use strict';

const path = require('path');
const safari = require('selenium-webdriver/safari');
const webdriver = require('selenium-webdriver');
const proxy = require('selenium-webdriver/proxy');
const pick = require('lodash.pick');
const isEmpty = require('lodash.isempty');
const log = require('intel').getLogger('browsertime.safari');
const util = require('../../support/util');
const get = require('lodash.get');

module.exports.configureBuilder = function(builder, baseDir, options) {
  /*
  const firefoxConfig = options.firefox || {};
  const moduleRootPath = path.resolve(__dirname, '..', '..', '..');

  const proxySettings = pick(options.proxy, ['http', 'https']);

  if (!isEmpty(proxySettings)) {
    let seleniumProxySettings = proxy.manual(proxySettings);
    seleniumProxySettings.httpProxyPort = proxySettings.http.split(':')[1];
    seleniumProxySettings.sslProxyPort = proxySettings.https.split(':')[1];
    ffOptions.setProxy(seleniumProxySettings);
  }
  */

  new safari.ServiceBuilder()
    .addArguments('--legacy')
    .build()
    .start()
    .then(serverUrl => {
      return new webdriver.Builder()
        .usingServer(serverUrl)
        .forBrowser('safari')
        .build();
    });
  /*
  builder
    .getCapabilities()
    .set('pageLoadStrategy', get(options, 'pageLoadStrategy', 'normal'));
    */
};
