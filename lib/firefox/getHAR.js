'use strict';

const log = require('intel').getLogger('browsertime.firefox');

// Get the HAR from Firefox
// Using https://github.com/firefox-devtools/har-export-trigger
module.exports = async function (runner, includeResponseBodies) {
  const script = `
    const callback = arguments[arguments.length - 1];
    async function triggerExport() {
      let result; 
      try {
        result = await HAR.triggerExport();
        if (result != undefined) {
          result.pages[0].title = document.URL;
          return callback({'har': {log: result}});
        } else {
          return callback({'error': 'HAR exporter returned undefined'});
        }
      }
      catch(e) {
        return callback({'error': 'HAR exporter throw e:' + e.toString() + ' ' + result});
      }
    };
    return triggerExport();
    `;

  log.info('Waiting on har-export-trigger to collect the HAR');
  try {
    const harResult = await runner.runAsyncScript(script, 'GET_HAR_SCRIPT');
    if (harResult.har) {
      // The HAR from Firefox always includes content and that can make the HAR file
      // really big, so we have an option to remove it.
      if (
        includeResponseBodies === 'none' ||
        includeResponseBodies === 'html'
      ) {
        for (let entry of harResult.har.log.entries) {
          if (includeResponseBodies === 'none') {
            delete entry.response.content.text;
          } else if (
            entry.response.content.mimeType &&
            entry.response.content.mimeType.indexOf('text/html') === -1
          ) {
            delete entry.response.content.text;
          }
        }
      }
      return harResult.har;
    } else {
      log.error(
        'Got an error from HAR Export Trigger ' + JSON.stringify(harResult)
      );
    }
  } catch (e) {
    log.error('Could not get the HAR from Firefox', e);
  }
};
