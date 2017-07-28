'use strict';

module.exports = {
  filterWhitelisted(userTimings, whitelistRegex) {
    const allowed = new RegExp(whitelistRegex);
    userTimings.marks = userTimings.marks.filter(mark =>
      allowed.test(mark.name)
    );
    userTimings.measures = userTimings.measures.filter(measure =>
      allowed.test(measure.name)
    );
  }
};
