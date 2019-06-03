Android Examples
================

This page will give a few example to get you up and running with
browsertime on Android devices.  Generally, add `--android` and then
configure the browser vehicle.

`browsertime --android https://www.sitespeed.io`

- The `--android` flag targets Chrome for Android by
  default.
- Chrome for Android means the `com.android.chrome` package (and the
  `com.google.android.apps.chrome.Main` activity).

`browsertime --android --browser chrome --chrome.android.deviceSerial SERIAL https://www.sitespeed.io`

- Use `chrome.android.deviceSerial` to target a specific device (by
  serial or by ADB-over-TCP/IP address.

`browsertime --android --browser firefox https://www.sitespeed.io`

- The `firefox` browser means GeckoView example by default.
- GeckoView example means the `org.mozilla.geckoview_example` package
  and the `org.mozilla.geckoview_example.GeckoViewActivity` activity.

`browsertime --android --browser firefox --firefox.android.deviceSerial '127.0.0.1:555' https://www.sitespeed.io`

- Use `firefox.android.deviceSerial` to target a specific device (by
  serial or by ADB-over-TCP/IP address.

`browsertime --android --browser firefox --firefox.android.package org.mozilla.fenix.debug --firefox.android.activity org.mozilla.fenix.IntentReceiverActivity https://www.sitespeed.io`

- Use `firefox.android.{package,activity}` to configure which Android
  package and activity is invoked for GeckoView (`--browser firefox`)
  Apps.

`browsertime --android --browser firefox --firefox.android.package org.mozilla.firefox --firefox.android.activity org.mozilla.gecko.BrowserApp --firefox.android.intentArgument=--ez --firefox.android.intentArgument=skipstartpane --firefox.android.intentArgument=true https://www.sitespeed.io`

- Use `firefox.android.intentArgument` to configure how the Android
  intent is launched.
- Prefer `firefox.android.intentArgument=...`, especially with
  arguments starting with hyphens, to avoid a browsertime parsing
  issue where the `--...` will be interpreted as an argument to
  browsertime itself.
- Passed through to `adb shell am start ...` follow the format at
  [https://developer.android.com/studio/command-line/adb#IntentSpec](https://developer.android.com/studio/command-line/adb#IntentSpec).
- To add multiple arguments, repeat `--firefox.android.intentArgument`
  arguments.

`browsertime --android --browser chrome --chrome.android.package org.mozilla.tv.firefox.debug --firefox.android.activity .MainActivity https://www.sitespeed.io`

- Use `chrome.android.{package,activity}` to configure which Android
  package and activity is invoked for WebView (`--browser chrome`)
  Apps.
