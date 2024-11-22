export const defaultFirefoxPreferences = {
  // https://searchfox.org/mozilla-central/source/testing/profiles/common/user.js
  // Common preferences file used by both unittest and perf harnesses.
  'app.update.checkInstallTime': false,
  'app.update.disabledForTesting': true,
  'browser.chrome.guess_favicon': false,
  'browser.dom.window.dump.enabled': true,
  'devtools.console.stdout.chrome': true,
  // Use a python-eval-able empty JSON array even though asrouter expects plain object
  'browser.newtabpage.activity-stream.asrouter.providers.cfr': '[]',
  'browser.newtabpage.activity-stream.asrouter.providers.cfr-fxa': '[]',
  'browser.newtabpage.activity-stream.asrouter.providers.snippets': '[]',
  'browser.newtabpage.activity-stream.feeds.section.topstories': false,
  'browser.newtabpage.activity-stream.feeds.snippets': false,
  'browser.newtabpage.activity-stream.tippyTop.service.endpoint': '',
  'browser.newtabpage.activity-stream.discoverystream.config': '[]',

  // For Activity Stream firstrun page, use an empty string to avoid fetching.
  'browser.newtabpage.activity-stream.fxaccounts.endpoint': '',
  // Background thumbnails in particular cause grief, and disabling thumbnails
  // in general can't hurt - we re-enable them when tests need them.
  'browser.pagethumbnails.capturing_disabled': true,
  // Tell the search service we are running in the US.  This also has the desired
  // side-effect of preventing our geoip lookup.
  'browser.search.region': 'US',
  // This will prevent HTTP requests for region defaults.
  'browser.search.geoSpecificDefaults': false,
  // Disable webapp updates.  Yes, it is supposed to be an integer.
  'browser.webapps.checkForUpdates': 0,
  // We do not wish to display datareporting policy notifications as it might
  // cause other tests to fail. Tests that wish to test the notification functionality
  // should explicitly disable this pref.
  'datareporting.policy.dataSubmissionPolicyBypassNotification': true,
  'dom.max_chrome_script_run_time': 0,
  'dom.max_script_run_time': 0, // no slow script dialogs
  'dom.send_after_paint_to_content': true,
  // Only load extensions from the application and user profile
  // AddonManager.SCOPE_PROFILE + AddonManager.SCOPE_APPLICATION
  'extensions.enabledScopes': 5,
  'extensions.legacy.enabled': true,
  // Turn off extension updates so they don't bother tests
  'extensions.update.enabled': false,
  // Prevent network access for recommendations by default. The payload is {'results':[]}.
  'extensions.getAddons.discovery.api_url':
    'data:;base64,eyJyZXN1bHRzIjpbXX0%3D',
  // Treat WebExtension API/schema warnings as errors.
  'extensions.webextensions.warnings-as-errors': true,
  // Disable useragent updates.
  'general.useragent.updates.enabled': false,
  // Ensure WR doesn't get enabled in tests unless we do it explicitly with the MOZ_WEBRENDER envvar.
  'gfx.webrender.all.qualified': false,
  'hangmonitor.timeout': 0, // no hang monitor
  'media.gmp-manager.updateEnabled': false,
  // Don't do network connections for mitm priming
  'security.certerrors.mitm.priming.enabled': false,
  // Make enablePrivilege continue to work for test code. :-(
  'security.turn_off_all_security_so_that_viruses_can_take_over_this_computer': true,
  'xpinstall.signatures.required': false,
  // Prevent Remote Settings to issue non local connections.
  'services.settings.server': 'data:,#remote-settings-dummy/v1',
  // Ensure autoplay is enabled for all platforms.
  'media.autoplay.default': 0, // 0=Allowed, 1=Blocked, 2=Prompt
  'media.autoplay.enabled.user-gestures-needed': true,
  'media.autoplay.ask-permission': false,
  'media.autoplay.block-webaudio': false,
  'media.allowed-to-play.enabled': true,
  // Ensure media can always play without delay
  'media.block-autoplay-until-in-foreground': false,
  'toolkit.telemetry.coverage.endpoint.base': 'http://localhost',
  // Don't ask for a request in testing unless explicitly set this as true.
  'media.geckoview.autoplay.request': false,
  // Base preferences file used by performance harnesses
  'app.normandy.api_url': 'https://127.0.0.1/selfsupport-dummy/',
  'browser.EULA.override': true,
  'browser.addon-watch.interval': -1, // Deactivate add-on watching
  // Disable Bookmark backups by default.
  'browser.bookmarks.max_backups': 0,
  'browser.cache.disk.smart_size.enabled': false,
  'browser.chrome.dynamictoolbar': false,
  'browser.contentHandlers.types.0.uri': 'http://127.0.0.1/rss?url=%s',
  'browser.contentHandlers.types.1.uri': 'http://127.0.0.1/rss?url=%s',
  'browser.contentHandlers.types.2.uri': 'http://127.0.0.1/rss?url=%s',
  'browser.contentHandlers.types.3.uri': 'http://127.0.0.1/rss?url=%s',
  'browser.contentHandlers.types.4.uri': 'http://127.0.0.1/rss?url=%s',
  'browser.contentHandlers.types.5.uri': 'http://127.0.0.1/rss?url=%s',
  'browser.link.open_newwindow': 2,
  'browser.newtabpage.activity-stream.default.sites': '',
  'browser.newtabpage.activity-stream.telemetry': false,
  'browser.reader.detectedFirstArticle': true,
  'browser.search.geoip.url': '',
  'browser.shell.checkDefaultBrowser': false,
  'browser.tabs.remote.autostart': true,
  'browser.warnOnQuit': false,
  'datareporting.healthreport.documentServerURI':
    'http://127.0.0.1/healthreport/',
  'devtools.chrome.enabled': false,
  'devtools.debugger.remote-enabled': false,
  'devtools.theme': 'light',
  'devtools.timeline.enabled': false,
  'dom.allow_scripts_to_close_windows': true,
  'dom.disable_open_during_load': false,
  'dom.disable_window_flip': true,
  'dom.disable_window_move_resize': true,
  'dom.push.connection.enabled': false,
  'extensions.autoDisableScopes': 10,
  'extensions.blocklist.enabled': false,
  'extensions.blocklist.url': 'http://127.0.0.1/extensions-dummy/blocklistURL',
  'extensions.checkCompatibility': false,
  'extensions.getAddons.get.url':
    'http://127.0.0.1/extensions-dummy/repositoryGetURL',
  'extensions.getAddons.compatOverides.url':
    'http://127.0.0.1/extensions-dummy/repositoryCompatOverridesURL',
  'extensions.getAddons.search.browseURL':
    'http://127.0.0.1/extensions-dummy/repositoryBrowseURL',
  'extensions.hotfix.url': 'http://127.0.0.1/extensions-dummy/hotfixURL',
  'extensions.systemAddon.update.url':
    'http://127.0.0.1/dummy-system-addons.xml',
  'extensions.update.background.url':
    'http://127.0.0.1/extensions-dummy/updateBackgroundURL',
  'extensions.update.notifyUser': false,
  'extensions.update.url': 'http://127.0.0.1/extensions-dummy/updateURL',
  'extensions.webservice.discoverURL':
    'http://127.0.0.1/extensions-dummy/discoveryURL',
  'identity.fxaccounts.auth.uri': 'https://127.0.0.1/fxa-dummy/',
  'identity.fxaccounts.migrateToDevEdition': false,
  // Avoid idle-daily notifications, to avoid expensive operations that may
  // cause unexpected test timeouts.
  'idle.lastDailyNotification': -1,
  'media.capturestream_hints.enabled': true,
  'media.gmp-manager.url': 'http://127.0.0.1/gmpmanager-dummy/update.xml',
  // Don't block old libavcodec libraries when testing, because our test systems
  // cannot easily be upgraded.
  'media.libavcodec.allow-obsolete': true,
  'media.navigator.enabled': true,
  'media.navigator.permission.disabled': true,
  'media.peerconnection.enabled': true,
  // Set places maintenance far in the future (the maximum time possible in an
  // int32_t) to avoid it kicking in during tests. The maintenance can take a
  // relatively long time which may cause unnecessary intermittents and slow down
  // tests. This, like many things, will stop working correctly in 2038.
  'places.database.lastMaintenance': 2_147_483_647,
  'plugin.state.flash': 0,
  'plugins.flashBlock.enabled': false,
  'privacy.reduceTimerPrecision': false, // Bug 1445243 - reduces precision of tests
  'security.enable_java': false,
  'security.fileuri.strict_origin_policy': false,
  'toolkit.telemetry.server': 'https://127.0.0.1/telemetry-dummy/',
  'startup.homepage_welcome_url': '',
  'startup.homepage_welcome_url.additional': '',
  'trailhead.firstrun.branches': 'join',

  // Preferences file used by the raptor harness
  'dom.performance.time_to_non_blank_paint.enabled': true,
  'dom.performance.time_to_contentful_paint.enabled': true,
  'dom.performance.time_to_dom_content_flushed.enabled': false,
  'dom.performance.time_to_first_interactive.enabled': true,

  // required for geckoview logging
  'geckoview.console.enabled': true,

  // required to prevent non-local access to push.services.mozilla.com
  // 'dom.push.connection.enabled': false,

  // get the console logging out of the webext into the stdout
  //'browser.dom.window.dump.enabled': true,
  //'devtools.console.stdout.chrome': true,
  'devtools.console.stdout.content': true,

  // prevent pages from opening after a crash
  'browser.sessionstore.resume_from_crash': false,

  // disable the background hang monitor
  'toolkit.content-background-hang-monitor.disabled': true,

  // disable async stacks to match release builds
  // https://developer.mozilla.org/en-US/docs/Mozilla/Benchmarking#Async_Stacks
  'javascript.options.asyncstack': false,

  // disable calls to detectportal.firefox.com
  'network.captive-portal-service.enabled': false,
  'network.connectivity-service.enabled': false,
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1930110
  'security.sandbox.warn_unprivileged_namespaces': false,

  // No need to delay wakelock releasing for testing
  'media.wakelock.audio.delay-releasing.ms': 0,
  'geo.provider.network.compare.url': '',
  'browser.region.network.url': '',
  // Don't pull Top Sites content from the network
  'browser.topsites.contile.enabled': false,
  // Don't pull weather data from the network
  'browser.newtabpage.activity-stream.discoverystream.region-weather-config':
    '',
  // Don't pull wallpaper content from the network
  'browser.newtabpage.activity-stream.newtabWallpapers.enabled': false,
  'browser.newtabpage.activity-stream.newtabWallpapers.v2.enabled': false,
  // Don't pull sponsored Top Sites content from the network
  'browser.newtabpage.activity-stream.showSponsoredTopSites': false,
  // See https://bugzilla.mozilla.org/show_bug.cgi?id=1930110
  // See https://github.com/sitespeedio/browsertime/issues/2211
  'browser.search.serpEventTelemetryCategorization.enabled': false,
  // Default Glean to "record but don't report" mode, and to never trigger
  // activity-based ping submission. Docs:
  // https://firefox-source-docs.mozilla.org/toolkit/components/glean/dev/preferences.html
  'telemetry.fog.test.localhost_port': -1,
  'telemetry.fog.test.activity_limit': -1,
  'telemetry.fog.test.inactivity_limit': -1
};
