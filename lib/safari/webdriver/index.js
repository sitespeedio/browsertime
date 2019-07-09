'use strict';

const safari = require('selenium-webdriver/safari');

module.exports.configureBuilder = async function(builder, baseDir, options) {
  const serverUrl = await new safari.ServiceBuilder().build().start();

  if (options.ios) {
    builder.getCapabilities().set('platformName', 'ios');
  }

  builder.usingServer(serverUrl);
};
