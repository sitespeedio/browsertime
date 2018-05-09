'use strict';

const SeleniumRunner = require('../../lib/core/seleniumRunner');

const BROWSERS = [];
const BASE_PATH = '/tmp/';

if (process.env.BROWSERTIME_TEST_BROWSER) {
  BROWSERS.push(process.env.BROWSERTIME_TEST_BROWSER);
} else {
  BROWSERS.push('chrome', 'firefox');
}

function timeout(promise, ms, errorMessage) {
  let timer = null;

  return Promise.race([
    new Promise((resolve, reject) => {
      timer = setTimeout(reject, ms, new Error(errorMessage));
      return timer;
    }),
    promise.then(value => {
      clearTimeout(timer);
      return value;
    })
  ]);
}

describe('SeleniumRunner', function() {
  let runner;

  describe('#start', function() {
    it('should reject when passed incorrect configuration', function() {
      runner = new SeleniumRunner(BASE_PATH, {
        browser: 'invalid'
      });
      return runner.start().should.be.rejected;
    });

    if (BROWSERS.includes('chrome')) {
      it.skip('should handle if Chrome crashes', function() {
        runner = new SeleniumRunner(BASE_PATH, {
          browser: 'chrome',
          chrome: {
            args: '--crash-test'
          },
          verbose: true
        });

        // Wait for session to actually have Chrome start up.
        return runner.start().catch(function(e) {
          throw e;
        }).should.be.rejected;
      });
    }
  });

  BROWSERS.forEach(function(browser) {
    describe('#loadAndWait - ' + browser, function() {
      beforeEach(function() {
        runner = new SeleniumRunner(BASE_PATH, {
          browser: browser,
          timeouts: {
            browserStart: 60000,
            scripts: 5000,
            pageLoad: 10000,
            pageCompleteCheck: 5000
          }
        });
        return runner.start();
      });

      it('should be able to load a url', function() {
        return runner.loadAndWait(
          'https://www.sitespeed.io/testcases/info/domElements.html'
        ).should.be.fulfilled;
      });
      it.skip('should fail if url takes too long to load, enable this when httpbin works again', function() {
        return runner.loadAndWait(
          'https://httpbin.org/delay/20',
          'return true'
        ).should.be.rejected;
      });

      it('should fail if wait script never returns true', function() {
        return runner.loadAndWait(
          'https://www.sitespeed.io/testcases/info/domElements.html',
          'return false'
        ).should.be.rejected;
      });

      it('should fail if wait script throws an exception', function() {
        return runner.loadAndWait(
          'https://www.sitespeed.io/testcases/info/domElements.html',
          'throw new Error("foo");'
        ).should.be.rejected;
      });

      it.skip('should fail if wait script hangs', function() {
        return runner.loadAndWait(
          'https://www.sitespeed.io/testcases/info/domElements.html',
          'while (true) {}; return true;'
        ).should.be.rejected;
      });

      afterEach(function() {
        return timeout(
          runner.stop(),
          10000,
          'Waited for ' + browser + ' to quit for too long'
        );
      });
    });

    describe('#runScript - ' + browser, function() {
      beforeEach(function() {
        runner = new SeleniumRunner({
          browser: browser,
          timeouts: {
            browserStart: 60000,
            scripts: 5000,
            pageLoad: 10000,
            pageCompleteCheck: 10000
          }
        });
        return runner.start().then(function() {
          return runner.loadAndWait('data:text/html;charset=utf-8,');
        });
      });

      it('should handle a boolean return', function() {
        return runner.runScript('return true;').should.become(true);
      });

      it('should handle a number return', function() {
        return runner.runScript('return 42;').should.become(42);
      });

      it('should handle an object return', function() {
        return runner
          .runScript('return window.performance.timing;')
          .should.eventually.contain.all.keys('fetchStart', 'domInteractive');
      });

      it('should handle an array return', function() {
        return runner
          .runScript('return window.performance.getEntriesByType("resource");')
          .should.eventually.be.an('array');
      });

      it('should fail if script throws an exception', function() {
        return runner.runScript('throw new Error("foo");').should.be.rejected;
      });

      /*
       FIXME: Apparently firefox can consider executeScript to succeed if it forcefully killed a hanging script.
       1) SeleniumRunner #runScript - firefox should fail if script hangs:
       AssertionError: expected promise to be rejected but it was fulfilled with 'A script on this page may be busy, or it may have stopped responding. You can stop the script now, open the script in the debugger, or let the script continue.\n\nScript: http://httpbin.org/html line 69 > Function:1'
       at null.<anonymous> (/Users/tobli/Development/btnext/node_modules/chai-as-promised/lib/chai-as-promised.js:122:55)
       at null.<anonymous> (/Users/tobli/Development/btnext/node_modules/chai-as-promised/lib/chai-as-promised.js:66:33)
       at Object.defineProperty.get (/Users/tobli/Development/btnext/node_modules/chai/lib/chai/utils/addProperty.js:35:29)
       at Context.<anonymous> (/Users/tobli/Development/btnext/test/seleniumRunnerTests.js:93:75)
       */

      it.skip('should fail if script hangs', function() {
        return runner.runScript(
          'while (true) {}; return true;'
        ).should.be.rejected;
      });

      afterEach(function() {
        return timeout(
          runner.stop(),
          10000,
          'Waited for ' + browser + ' to quit for too long'
        );
      });
    });

    describe('#takeScreenshot - ' + browser, function() {
      beforeEach(function() {
        runner = new SeleniumRunner(BASE_PATH, {
          browser: browser,
          timeouts: {
            browserStart: 60000,
            scripts: 5000,
            pageLoad: 10000,
            pageCompleteCheck: 10000
          }
        });
        return runner.start().then(function() {
          return runner.loadAndWait('data:text/html;charset=utf-8,');
        });
      });

      it('should take a screen shot', function() {
        return runner
          .takeScreenshot()
          .should.eventually.be.an.instanceof(Buffer);
      });
    });
  });
});
