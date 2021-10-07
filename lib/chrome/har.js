'use strict';

const log = require('intel').getLogger('browsertime.chrome');
const perflogParser = require('chrome-har');
const harBuilder = require('../support/har');
const { Type } = require('selenium-webdriver').logging;

module.exports = async function (
  runner,
  result,
  index,
  cdpClient,
  logPerfEntries,
  includeResponseBodies,
  mobileEmulation,
  androidClient,
  chrome,
  aliasAndUrl
) {
  log.debug('Getting performance logs from Chrome');

  const logs = await runner.getLogs(Type.PERFORMANCE);
  const messages = logs.map(entry => JSON.parse(entry.message).message);

  if (logPerfEntries) {
    if (!result.extraJson) {
      result.extraJson = {};
    }
    result.extraJson[`chromePerflog-${index}.json`] = messages;
  }
  // CLEANUP since Chromedriver 2.29 there's a bug
  // https://bugs.chromium.org/p/chromedriver/issues/detail?id=1811
  await runner.getLogs(Type.PERFORMANCE);

  const har = perflogParser.harFromMessages(messages);

  if (includeResponseBodies === 'html' || includeResponseBodies === 'all') {
    await cdpClient.setResponseBodies(har);
  }

  const versionInfo = (
    await cdpClient.send('Browser.getVersion')
  ).product.split('/');
  const info = {
    name: versionInfo[0],
    version: versionInfo[1]
  };

  if (mobileEmulation) {
    info.name = `Chrome Emulated ${chrome.mobileEmulation.deviceName}`;
  }
  harBuilder.addBrowser(har, info.name, info.version);

  if (androidClient) {
    har.log._android = await androidClient.getModel();
    har.log._android.id = androidClient.id;
  }

  if (har.log.pages.length > 0) {
    har.log.pages[0].title = `${result.url} run ${index}`;
    // Hack to add the URL from a SPA
    if (result.alias && !aliasAndUrl[result.alias]) {
      aliasAndUrl[result.alias] = result.url;
      har.log.pages[0]._url = result.url;
    } else if (result.alias && aliasAndUrl[result.alias]) {
      har.log.pages[0]._url = aliasAndUrl[result.alias];
    } else {
      har.log.pages[0]._url = result.url;
    }
  }
  return har;
};
