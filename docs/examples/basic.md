Basic Examples
==============

This page will give a few example to get you up and running with browsertime.

browsertime --help

- Use the help option if you would like to know what options are available.

browsertime https://www.sitespeed.io

- The only required option when running browsertime is the URL you want to test.

browsertime https://www.sitespeed.io -n 5

- If you would like to override the default number of runs. It defaults to 3.

browsertime https://www.sitespeed.io --screenshot

- If you would like to capture screenshots during your run(s). It will capture a screenshot for each run.

browsertime https://www.sitespeed.io -b chrome

- If you would like to override the default browser used. Defaults to Firefox.

browsertime https://www.sitespeed.io --prettyPrint

- If you would like to output the HAR in a more human readable format.

browsertime https://www.sitespeed.io --delay 5000

- If you would like to deploy the time in between test runs. This option takes milliseconds and defaults no delay(0).

browsertime https://www.sitespeed.io --userAgent 'Googlebot/2.1 (+http://www.googlebot.com/bot.html)'

- If you want to customize the user agent passed to the test runs you can do so with the user agent option.
