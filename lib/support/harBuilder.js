'use strict';

let merge = require('lodash.merge'),
  pick = require('lodash.pick'),
  isEmpty = require('lodash.isempty'),
  version = require('../../package').version;

function generateUniquePageId(baseId, existingIdMap) {
  let newId = baseId;
  while (existingIdMap.has(newId)) {
    newId = newId + '-1';
  }

  return newId;
}

module.exports = {
  addBrowser: function(har, name, version, comment) {
    merge(har.log, {
      browser: {
        name,
        version,
        comment
      }
    });

    if (!comment) {
      delete har.log.browser.comment;
    }

    return har;
  },

  addCreator: function(har, comment) {
    merge(har.log, {
      creator: {
        name: 'Browsertime',
        version: version,
        comment: comment
      }
    });

    if (!comment) {
      delete har.log.creator.comment;
    }

    return har;
  },

  mergeHars: function(hars) {
    if (isEmpty(hars)) {
      return undefined;
    }
    if (hars.length === 1) {
      return hars[0];
    }

    let firstLog = hars[0].log;
    let combinedHar = {
      log: pick(firstLog, ['version', 'creator', 'browser', 'comment'])
    };

    let pagesById = new Map();
    let allEntries = [];

    hars.forEach(har => {
      let pages = har.log.pages;
      let entries = har.log.entries;
      pages.forEach(page => {
        let pageId = page.id;
        if (pagesById.has(pageId)) {
          const oldPageId = pageId;
          pageId = generateUniquePageId(oldPageId, pagesById);
          page.id = pageId;
          entries = entries.map(entry => {
            if (entry.pageref === oldPageId) {
              entry.pageref = pageId;
            }
            return entry;
          });
        }
        pagesById.set(pageId, page);
      });
      allEntries = allEntries.concat(entries);
    });

    combinedHar.log.pages = Array.from(pagesById.values());
    combinedHar.log.entries = allEntries;

    return combinedHar;
  }
};
