'use strict';

const path = require('path');
const firefox = require('selenium-webdriver/firefox');
const proxy = require('selenium-webdriver/proxy');
const pick = require('lodash.pick');
const isEmpty = require('lodash.isempty');
const log = require('intel').getLogger('browsertime.firefox');
const get = require('lodash.get');
const geckodriver = require('@sitespeed.io/geckodriver');
const defaultFirefoxPreferences = require('./firefoxPreferences');
const util = require('../../support/util');

module.exports.configureBuilder = function(builder, baseDir, options) {
  const firefoxConfig = options.firefox || {};
  const moduleRootPath = path.resolve(__dirname, '..', '..', '..');
  const ffOptions = new firefox.Options();

  const profileTemplatePath = path.resolve(
    moduleRootPath,
    'browsersupport',
    'firefox-profile'
  );

  ffOptions.setProfile(profileTemplatePath);

  if (options.userAgent) {
    ffOptions.setPreference('general.useragent.override', options.userAgent);
  }

  if (firefoxConfig.collectMozLog) {
    process.env.MOZ_LOG =
      'timestamp,nsHttp:5,cache2:5,nsSocketTransport:5,nsHostResolver:5';
    process.env.MOZ_LOG_FILE = `${baseDir}/moz_log.txt`;
  }

  // Output the window recorder image frames to a base directory.
  // This pref expects a trailing slash.
  if (firefoxConfig.windowRecorder) {
    ffOptions.setPreference('layers.windowrecording.path', `${baseDir}/`);
  }

  // try to remove the caching between runs
  /*
   profile.setPreference('dom.enable_resource_timing', true);
   */
  Object.keys(defaultFirefoxPreferences).forEach(function(pref) {
    ffOptions.setPreference(pref, defaultFirefoxPreferences[pref]);
  });

  if (!options.skipHar) {
    // Hack for opening the toolbar
    // In Firefox 61 we need to have devtools open but do not need to choose netmonitor
    ffOptions.setPreference('devtools.toolbox.selectedTool', 'netmonitor');
    ffOptions.setPreference('devtools.toolbox.footer.height', 0);

    ffOptions.addExtensions(
      path.resolve(
        moduleRootPath,
        'vendor',
        'har_export_trigger-0.6.0-an+fx.xpi'
      )
    );
  }

  // Browsertime own extension
  ffOptions.addExtensions(
    path.resolve(moduleRootPath, 'vendor', 'browsertime-0.18.0-an+fx.xpi')
  );

  if (options.extension) {
    const extensions = !Array.isArray(options.extension)
      ? [options.extension]
      : options.extension;
    for (const extension of extensions) {
      ffOptions.addExtensions(extension);
    }
  }

  ffOptions.setPreference('devtools.chrome.enabled', true);

  const userPrefs = util.toArray(firefoxConfig.preference);
  for (const pref of userPrefs) {
    const nameAndValue = pref.split(':');
    if (nameAndValue.length === 2) {
      const value =
        nameAndValue[1] === 'false'
          ? false
          : nameAndValue[1] === 'true'
          ? true
          : nameAndValue[1];
      // Firefox handles 0, "0", false differently. Turning of OSCP
      // security.OCSP.enabled:0
      // Only accepts a zero as integer
      if (isNaN(value)) {
        ffOptions.setPreference(nameAndValue[0], value);
      } else {
        ffOptions.setPreference(nameAndValue[0], Number(value));
      }
    } else {
      log.error(
        'Firefox preferences %s need to of the format key:value, preference was not set',
        pref
      );
    }
  }

  let firefoxTypes = [
    get(firefoxConfig, 'binaryPath')
      ? get(firefoxConfig, 'binaryPath')
      : undefined,
    get(firefoxConfig, 'nightly') ? firefox.Channel.NIGHTLY : undefined,
    get(firefoxConfig, 'beta') ? firefox.Channel.BETA : undefined,
    get(firefoxConfig, 'developer') ? firefox.Channel.AURORA : undefined
  ];

  firefoxTypes = firefoxTypes.filter(function(n) {
    return n !== undefined;
  });

  ffOptions.setBinary(
    firefoxTypes.length > 0 ? firefoxTypes[0] : firefox.Channel.RELEASE
  );

  ffOptions.addArguments('-no-remote');

  // Another hack for opening devtools to make netmonitor work
  if (!options.skipHar) {
    ffOptions.addArguments('-devtools');
  }

  if (options.headless) {
    ffOptions.headless();
  }

  if (firefoxConfig.acceptInsecureCerts) {
    builder.getCapabilities().set('acceptInsecureCerts', true);
  }

  const connectivity = options.connectivity || {};

  if (
    connectivity.engine === 'tsproxy' &&
    connectivity.tsproxy &&
    connectivity.profile !== 'native'
  ) {
    ffOptions.setPreference('network.proxy.socks', 'localhost');
    ffOptions.setPreference(
      'network.proxy.socks_port',
      connectivity.tsproxy.port
    );
    ffOptions.setPreference('network.proxy.type', 1);
  }
  builder
    .getCapabilities()
    .set('pageLoadStrategy', get(options, 'pageLoadStrategy', 'normal'));

  const proxySettings = pick(options.proxy, ['http', 'https']);

  if (!isEmpty(proxySettings)) {
    builder.setProxy(proxy.manual(proxySettings));
  }

  builder.setFirefoxOptions(ffOptions);

  // ugly hack for geckodriver
  // we need it until Selenium NodeJS version supports setting geckodriver
  // Selenium looks for geckodriver in the PATH.
  const geckoPath = path.dirname(geckodriver.binPath());
  process.env.PATH = [geckoPath, process.env.PATH].join(path.delimiter);
};
