'use strict';
module.exports = `
return (function(options) {
    try { 
            const end = window.performance.timing.loadEventEnd;
            const start = window.performance.timing.navigationStart;
            const maxLoadTime = options.maxLoadTime || 60 * 1000;
            const waitTime = options.waitTime || 5 * 1000;
            if (performance.now() > maxLoadTime) {
                return true;
            } else {
                return (end > 0) && (performance.now() > end - start + waitTime);
            }
    } 
    catch(e) {
        return true;
    }
})(arguments[arguments.length - 1]);
`;
