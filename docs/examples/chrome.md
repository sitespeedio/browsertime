Chrome Examples
===============

This page shows a few of the options specific to Chrome.

browsertime https://www.sitespeed.io -b chrome

- Will use chrome's native performance logs to generate a HAR file.

browsertime https://www.sitespeed.io --chrome.collectPerfLog -b chrome

- Used for debugging  chrome's native HAR export you can have it additionally output the Chrome performance logs.

browsertime https://www.sitespeed.io --chrome.args -b chrome                        

- Extra command line args to pass directly to the chrome process. (e.g. --no-sandbox)

browsertime https://www.sitespeed.io --chrome.binaryPath -b chrome                  

- Path to custom Chrome binary (e.g. Chrome Canary). On OS X, the path should be to the binary inside the app bundle. (e.g. /Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary)

browsertime https://www.sitespeed.io --chrome.mobileEmulation.deviceName 'Apple iPad' -b chrome

- Name of device to emulate (see list in Chrome DevTools)

browsertime https://www.sitespeed.io --chrome.mobileEmulation.width 360 --chrome.mobileEmulation.height 640 --chrome.mobileEmulation.pixelRatio 2.0 -b chrome

- Width in pixels of emulated mobile screen (e.g. 360), Height in pixels of emulated mobile screen (e.g. 640), Pixel ration of emulated mobile screen (e.g. 2.0)
