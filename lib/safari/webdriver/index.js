'use strict';

module.exports.configureBuilder = async function(builder, baseDir, options) {
  const safariOptions = options.safari || {};
  builder
    .getCapabilities()
    .set('platformName', safariOptions.ios ? 'iOS' : 'mac');

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
};
