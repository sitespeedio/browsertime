Advance Examples
================

This page shows a few of the more advance examples of browsertime

browsertime https://www.sitespeed.io --script ~/browserscripts/scripts.js

- The script option allows for a single file or a directory to be passed to gather custom values that will be available in the JSON output. An additional page will be created to cover this option in the future.

bin/browsertime.js https://www.sitespeed.io --pageCompleteCheck 'return window.performance.timing.loadEventEnd>0'

- You can pass in a javascript snippet that is repeatedly queried to see if page has completed loading (indicated by the script returning true). Default script is 'return window.performance.timing.loadEventEnd>0'.
