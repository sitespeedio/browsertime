'use strict';

module.exports = `
return (function() {
  try {
    var end = window.performance.timing.loadEventEnd;
    return (end > 0) && (Date.now() > end + 10000);
  } catch(e) {
	return true;
  }
})();
`;
