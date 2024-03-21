import { Options } from 'selenium-webdriver/safari.js';

export async function configureBuilder(builder, baseDir, options) {
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
    let o = new Options();
    o = o.setTechnologyPreview(true);
    o.setBrowserName('Safari Technology Preview');
    builder.setSafariOptions(o);
  }
}
