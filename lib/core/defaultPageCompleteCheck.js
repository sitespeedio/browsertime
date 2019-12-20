'use strict';
module.exports = `
return (function(waitTime) {
    try { 
            var end = window.performance.timing.loadEventEnd;
            var start= window.performance.timing.navigationStart;
            return (end > 0) && (performance.now() > end - start + waitTime);
    } 
    catch(e) {
        return true;
    }
})(arguments[arguments.length - 1]);
`;
