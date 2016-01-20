'use strict';

let merge = require('lodash.merge'),
  pick = require('lodash.pick'),
  version = require('../../package').version;

function generateUniquePageId(baseId, existingIdMap) {
  let newId = baseId;
  while (existingIdMap.has(newId)) {
    newId = newId + '-1';
  }

  return newId;
}

module.exports = {
  addCreator: function(har, comment) {
    merge(har.log, {
      creator: {
        'name': 'Browsertime',
        'version': version,
        'comment': comment
      }
    });

    if (!comment) {
      delete har.log.creator.comment;
    }

    return har;
  },

  mergeHars: function(hars) {
    if (hars.length === 0) {
      return null;
    }

    let firstLog = hars[0].log;
    let combinedHar = {
      log: pick(firstLog, ['version', 'creator', 'browser', 'comment'])
    };

    let pagesById = new Map();
    let allEntries = [];

    hars.forEach((har) => {
      let pages = har.log.pages;
      pages.forEach((page) => {
        let pageId = page.id;
        let entries = har.log.entries;
        if (pagesById.has(pageId)) {
          pageId = generateUniquePageId(pageId, pagesById);
          page.id = pageId;
          entries = entries.map((entry) => {
            entry.pageref = pageId;
            return entry;
          })
        }
        pagesById.set(pageId, page);
        allEntries = allEntries.concat(entries);
      });
    });

    combinedHar.log.pages = Array.from(pagesById.values());
    combinedHar.log.entries = allEntries;

    return combinedHar;
  }
};
