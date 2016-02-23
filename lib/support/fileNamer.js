'use strict';

let util = require('util'),
  urlParser = require('url'),
  moment = require('moment');

module.exports.fileNamer = function() {
  // ensure all files for a given name gets the same timestamp
  // Removing ':' makes for better file names, and is also valid ISO8601 dates.
  let timestamp = moment().format().replace(/:/g, '');

  return {
      getNameFromUrl(url, extension) {
        let host = urlParser.parse(url).host;
        host = host.split('.').join('-');
        return util.format('%s-%s.%s', host, timestamp, extension);
      }
  };
};