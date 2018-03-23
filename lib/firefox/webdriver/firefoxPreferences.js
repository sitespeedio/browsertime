'use strict';

module.exports = {
  // Use hidden time_to_non_blank_paint
  'dom.performance.time_to_non_blank_paint.enabled': true,
  // IPV6 sometimes makes DNS slow on Linux
  'network.dns.disableIPv6': true,

  /* Extra tracking protection https://wiki.mozilla.org/Security/Tracking_protection */
  'privacy.trackingprotection.enabled': false,
  'privacy.trackingprotection.pbmode.enabled': false,
  'privacy.trackingprotection.annotate_channels': false,
  'services.sync.prefs.sync.privacy.trackingprotection.enabled': false,
  'services.sync.prefs.sync.privacy.trackingprotection.pbmode.enabled': false,
  'browser.safebrowsing.provider.mozilla.updateURL': '',
  'browser.safebrowsing.provider.mozilla.gethashURL': '',

  /* Disable heartbeat https://wiki.mozilla.org/Firefox/Shield/Heartbeat */
  'browser.selfsupport.url': '',
  'browser.selfsupport.enabled': false,

  /* Disable telemetry  https://wiki.mozilla.org/Telemetry/Testing */
  'toolkit.telemetry.prompted': 2,
  'toolkit.telemetry.rejected': true,
  'toolkit.telemetry.enabled': false,
  'toolkit.telemetry.reportingpolicy.firstRun': false,
  // Preferences from
  // https://searchfox.org/mozilla-central/source/testing/talos/talos/config.py
  // slightly modified
  'app.update.enabled': false,
  'browser.addon-watch.interval': -1,
  'browser.aboutHomeSnippets.updateUrl': 'https://127.0.0.1/about-dummy/',
  'browser.bookmarks.max_backups': 0,
  'browser.cache.disk.smart_size.enabled': false,
  'browser.cache.disk.smart_size.first_run': false,
  'browser.chrome.dynamictoolbar': false,
  'browser.dom.window.dump.enabled': true,
  'browser.EULA.override': true,
  'browser.link.open_newwindow': 2,
  'browser.reader.detectedFirstArticle': true,
  'browser.shell.checkDefaultBrowser': false,
  'browser.warnOnQuit': false,
  'browser.tabs.remote.autostart': false,
  'dom.allow_scripts_to_close_windows': true,
  'dom.disable_open_during_load': false,
  'dom.disable_window_flip': true,
  'dom.disable_window_move_resize': true,
  'dom.max_chrome_script_run_time': 0,
  'dom.max_script_run_time': 0,
  'extensions.autoDisableScopes': 10,
  'extensions.checkCompatibility': false,
  'extensions.enabledScopes': 5,
  'extensions.update.notifyUser': false,
  'hangmonitor.timeout': 0,
  // 'network.proxy.http': 'localhost',
  // 'network.proxy.http_port': 80,
  // 'network.proxy.type': 1,
  'idle.lastDailyNotification': new Date().getTime(),
  'privacy.reduceTimerPrecision': false,
  'places.database.lastMaintenance': 7258114800,
  'security.enable_java': false,
  'security.fileuri.strict_origin_policy': false,
  'dom.send_after_paint_to_content': true,
  take_over_this_computer: true,
  'browser.newtabpage.activity-stream.default.sites': '',
  'browser.newtabpage.activity-stream.telemetry': false,
  'browser.newtabpage.activity-stream.tippyTop.service.endpoint': '',
  'browser.newtabpage.activity-stream.feeds.section.topstories': false,
  'browser.newtabpage.activity-stream.feeds.snippets': false,
  'browser.safebrowsing.downloads.remote.url':
    'http://127.0.0.1/safebrowsing-dummy/downloads',
  'browser.safebrowsing.provider.google.gethashURL':
    'http://127.0.0.1/safebrowsing-dummy/gethash',
  'browser.safebrowsing.provider.google.updateURL':
    'http://127.0.0.1/safebrowsing-dummy/update',
  'browser.safebrowsing.provider.google4.gethashURL':
    'http://127.0.0.1/safebrowsing4-dummy/gethash',
  'browser.safebrowsing.provider.google4.updateURL':
    'http://127.0.0.1/safebrowsing4-dummy/update',
  'privacy.trackingprotection.introURL':
    'http://127.0.0.1/trackingprotection/tour',
  'browser.safebrowsing.phishing.enabled': false,
  'browser.safebrowsing.malware.enabled': false,
  'browser.safebrowsing.blockedURIs.enabled': false,
  'browser.safebrowsing.downloads.enabled': false,
  'browser.safebrowsing.passwords.enabled': false,
  'plugins.flashBlock.enabled': false,
  'browser.search.isUS': true,
  'browser.search.countryCode': 'US',
  'browser.search.geoip.url': '',
  'browser.urlbar.userMadeSearchSuggestionsChoice': true,
  'extensions.update.url': 'http://127.0.0.1/extensions-dummy/updateURL',
  'extensions.update.background.url':
    'http://127.0.0.1/extensions-dummy/updateBackgroundURL',
  'extensions.blocklist.enabled': false,
  'extensions.blocklist.url': 'http://127.0.0.1/extensions-dummy/blocklistURL',
  'extensions.hotfix.url': 'http://127.0.0.1/extensions-dummy/hotfixURL',
  'extensions.update.enabled': false,
  'extensions.webservice.discoverURL':
    'http://127.0.0.1/extensions-dummy/discoveryURL',
  'extensions.getAddons.get.url':
    'http://127.0.0.1/extensions-dummy/repositoryGetURL',
  'extensions.getAddons.getWithPerformance.url':
    'http://127.0.0.1/extensions-dummy',
  'extensions.getAddons.search.browseURL':
    'http://127.0.0.1/extensions-dummy/repositoryBrowseURL',
  'media.gmp-manager.url': 'http://127.0.0.1/gmpmanager-dummy/update.xml',
  'media.gmp-manager.updateEnabled': false,
  'extensions.systemAddon.update.url':
    'http://127.0.0.1/dummy-system-addons.xml',
  'app.normandy.api_url': 'https://127.0.0.1/selfsupport-dummy/',
  'browser.ping-centre.staging.endpoint': 'https://127.0.0.1/pingcentre/dummy/',
  'browser.ping-centre.production.endpoint':
    'https://127.0.0.1/pingcentre/dummy/',
  'media.navigator.enabled': true,
  'media.peerconnection.enabled': true,
  'media.navigator.permission.disabled': true,
  'media.capturestream_hints.enabled': true,
  'browser.contentHandlers.types.0.uri': 'http://127.0.0.1/rss?url=%s',
  'browser.contentHandlers.types.1.uri': 'http://127.0.0.1/rss?url=%s',
  'browser.contentHandlers.types.2.uri': 'http://127.0.0.1/rss?url=%s',
  'browser.contentHandlers.types.3.uri': 'http://127.0.0.1/rss?url=%s',
  'browser.contentHandlers.types.4.uri': 'http://127.0.0.1/rss?url=%s',
  'browser.contentHandlers.types.5.uri': 'http://127.0.0.1/rss?url=%s',
  'identity.fxaccounts.auth.uri': 'https://127.0.0.1/fxa-dummy/',
  'datareporting.healthreport.documentServerURI':
    'http://127.0.0.1/healthreport/',
  'datareporting.policy.dataSubmissionPolicyBypassNotification': true,
  'general.useragent.updates.enabled': false,
  'browser.webapps.checkForUpdates': 0,
  'browser.search.geoSpecificDefaults': false,
  'browser.snippets.enabled': false,
  'browser.snippets.syncPromo.enabled': false,
  'toolkit.telemetry.server': 'https://127.0.0.1/telemetry-dummy/',
  'experiments.manifest.uri': 'https://127.0.0.1/experiments-dummy/manifest',
  'network.http.speculative-parallel-limit': 0,
  'lightweightThemes.selectedThemeID': '',
  'devtools.chrome.enabled': false,
  'devtools.debugger.remote-enabled': false,
  'devtools.theme': 'light',
  'devtools.timeline.enabled': false,
  'identity.fxaccounts.migrateToDevEdition': false,
  'plugin.state.flash': 0,
  'media.libavcodec.allow-obsolete': true,
  'extensions.legacy.enabled': true,
  'xpinstall.signatures.required': false
};
