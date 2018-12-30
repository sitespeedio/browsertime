'use strict';

module.exports = `
return (function(waitTime) {
    try { 
        var end = window.performance.timing.loadEventEnd;
        return (end > 0) && (Date.now() > end + waitTime);
    } catch(e) {
        return true;
    }
})(arguments[arguments.length - 1]);
`;
