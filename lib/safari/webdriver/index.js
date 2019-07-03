'use strict';

const safari = require('selenium-webdriver/safari');

module.exports.configureBuilder = async function(builder) {
  const serverUrl = await new safari.ServiceBuilder().build().start();

  builder.usingServer(serverUrl);
};
