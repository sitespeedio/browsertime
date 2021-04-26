(function() {
    // simple CPU benchmarking
    // following https://github.com/wikimedia/mediawiki-extensions-NavigationTiming/blob/master/modules/ext.navigationTiming.js
    // except not in worker to avoid CSP issues.
    const amount = 100000000;
    const startTime = performance.now();
    for ( let i = amount; i > 0; i-- ) {
        // empty
    }
    return Math.round( performance.now() - startTime );
 })();