# Browsertime changelog

version 0.5 (NOT YET RELEASED)
------------------------
* Updated maven groupId and Java package name to use net.browsertime instead of com.soulgalore. This does not affect
  users of the command line tool, only programmers embedding the browsertime jar in other tools.

version 0.4 (2013-11-15)
------------------------
* User Timing marks and measures should now be compatible with Firefox 25. Custom user marks are also converted to
  "synthetic" measures, with duration as time from the navigationStart event. This way user marks are also
  included in statistics.

version 0.3 (2013-11-09)
------------------------
* Added frontEndTime (responseEnd & loadEventStart) & backEndTime (navigationStart, responseStart) measurements to make it cleaner when comparing.
* Collect page data (browser version etc.) on first timing run. This reduces the number of times the browser is
  launched, making Browsertime run faster.
* Added -t option to set timeout value when loading urls (default remains 60 seconds).
* Created packages as zip and tar.gz that includes a shell script to run Browsertime, all jars, README, and CHANGELOG.

version 0.2 (2013-11-05)
------------------------
* Add --raw flag to control if data for individual runs is included in output.
  The default is to not include run data. NOTE - this is a change in the default
  output from 0.1.
* Add optional --compact flag to disable pretty printing of xml and json.
* Update format of xml/json (NOTE - incompatible changes from 0.1)
 - all metrics and statistics are now floating point numbers
 - numbers in json output are now represented as strings (surrounded by quotes). This is an
    unfortunate side-effect of avoiding printing numbers in scientific notation.
 - time property of marks and measurements have been renamed startTime
 - measurements and statistics are now sorted according to start time.
* Changed max wait time for the Selenium driver from 30 s to 60 s 
* Updated org.seleniumhq.selenium:selenium-java from 2.35.0 to 2.37.1
* Fix for Firefox 25 that added toJson in window.performance.timings

version 0.1 (2013-10-07)
------------------------
* First release
