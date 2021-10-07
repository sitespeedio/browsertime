'use strict';
const s = require('selenium-webdriver/safari');

module.exports.configureBuilder = async function (builder, baseDir, options) {
  const safariOptions = options.safari || {};
  builder
    .getCapabilities()
    .set(
      'platformName',
      safariOptions.ios || safariOptions.useSimulator ? 'iOS' : 'mac'
    );

  if (safariOptions.deviceName) {
    builder
      .getCapabilities()
      .set('safari:deviceName', safariOptions.deviceName);
  }

  if (safariOptions.deviceUDID) {
    builder
      .getCapabilities()
      .set('safari:deviceUDID', safariOptions.deviceUDID);
  }

  if (safariOptions.deviceType) {
    builder
      .getCapabilities()
      .set('safari:deviceType', safariOptions.deviceType);
  }

  if (safariOptions.useSimulator) {
    builder
      .getCapabilities()
      .set('safari:useSimulator', safariOptions.useSimulator);
  }

  if (safariOptions.diagnose) {
    builder.getCapabilities().set('safari:diagnose', true);
  }

  if (safariOptions.ios) {
    builder.usingServer(`http://localhost:${options.safariDriverPort}`);
  }

  if (safariOptions.useTechnologyPreview) {
    let o = new s.Options();
    o = o.setTechnologyPreview(true);
    builder.setSafariOptions(o);
  }
};
