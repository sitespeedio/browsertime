'use strict';

let merge = require('lodash.merge'),
  version = require('../../package').version;

module.exports = {
  addCreator: function(har, comment) {
    merge(har.log, {
      creator: {
        'name': 'Browsertime',
        'version': version,
        'comment': comment
      }
    });
    return har;
  }
};
