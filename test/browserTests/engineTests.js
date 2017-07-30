'use strict';

const path = require('path'),
  Engine = require('../../lib/core/engine');

const BROWSERS = [];

if (process.env.BROWSERTIME_TEST_BROWSER) {
  BROWSERS.push(...process.env.BROWSERTIME_TEST_BROWSER.split(' '));
} else {
  BROWSERS.push('chrome', 'firefox');
}

describe('Engine', function() {
  let engine;

  BROWSERS.forEach(function(browser) {
    describe('#run - ' + browser, function() {
      const scripts = {
        foo: '(function () {return "fff";})()',
        uri: 'document.documentURI',
        fourtytwo: '(function () {return 42;})()'
      };

      beforeEach(function() {
        engine = new Engine({
          browser: browser,
          iterations: 2,
          delay: 17
        });
        return engine.start();
      });

      it('should be able to load a url', function() {
        // somewhat clunky way to ignore generated har data in test.
        let browserScripts = engine
          .run('http://httpbin.org/html', { scripts })
          .then(function(r) {
            return r.browserScripts;
          });
        return browserScripts.should.become([
          {
            scripts: {
              foo: 'fff',
              uri: 'http://httpbin.org/html',
              fourtytwo: 42
            }
          },
          {
            scripts: {
              foo: 'fff',
              uri: 'http://httpbin.org/html',
              fourtytwo: 42
            }
          }
        ]);
      });

      it('should be able to load multiple urls', function() {
        return engine
          .run('http://httpbin.org/html', { scripts })
          .then(function() {
            return engine.run('http://httpbin.org/html', { scripts });
          }).should.be.fulfilled;
      });

      it('should be able to generate a har', function() {
        // somewhat clunky way to ignore generated har data in test.
        return engine
          .run('http://httpbin.org/html', { scripts })
          .then(function(r) {
            return r.har.should.have.nested.property(
              'log.entries[0].request.url'
            );
          });
      });

      afterEach(function() {
        return engine
          .stop()
          .timeout(10000, 'Waited for ' + browser + ' to quit for too long');
      });
    });

    describe('#run async - ' + browser, function() {
      const syncScripts = {
          foo: '(function () {return "fff";})()',
          uri: 'document.documentURI',
          fourtytwo: '(function () {return 42;})()'
        },
        asyncScripts = {
          promiseFourtyThree: 'Promise.resolve(43)'
        };

      beforeEach(function() {
        engine = new Engine({
          browser: browser,
          iterations: 1,
          skipHar: true
        });
        return engine.start();
      });

      it('should be able to run async script', function() {
        let browserScripts = engine
          .run(
            'http://httpbin.org/html',
            { scripts: syncScripts },
            { scripts: asyncScripts }
          )
          .then(function(r) {
            return r.browserScripts;
          });
        return browserScripts.should.become([
          {
            scripts: {
              foo: 'fff',
              uri: 'http://httpbin.org/html',
              fourtytwo: 42,
              promiseFourtyThree: 43
            }
          }
        ]);
      });

      it('should be able to run async fetch script', function() {
        let browserScripts = engine
          .run('http://httpbin.org/html', null, {
            scripts: {
              fetched: `(function() {
            var request = new Request(document.URL, {
              redirect: 'follow',
              destination: 'document'
            });

            return fetch(request).then(response => response.ok);
          })()`
            }
          })
          .then(function(r) {
            return r.browserScripts;
          });
        return browserScripts.should.become([
          {
            scripts: {
              fetched: true
            }
          }
        ]);
      });

      afterEach(function() {
        return engine
          .stop()
          .timeout(10000, 'Waited for ' + browser + ' to quit for too long');
      });
    });

    describe('#pre/post scripts - ' + browser, function() {
      function loadTaskFile(file) {
        return require(path.resolve(__dirname, '..', 'prepostscripts', file));
      }

      const scripts = {
        foo: '(function () {return "fff";})()',
        uri: 'document.documentURI',
        fourtytwo: '(function () {return 42;})()'
      };

      beforeEach(function() {
        engine = new Engine({
          browser: browser,
          iterations: 1,
          skipHar: true,
          preTask: loadTaskFile('preSample.js'),
          postTask: [
            loadTaskFile('postSample.js'),
            loadTaskFile('postSample2.js')
          ]
        });
        return engine.start();
      });

      it('should run pre and post tasks', function() {
        return engine.run('data:text/html;charset=utf-8,', { scripts });
      });

      afterEach(function() {
        return engine
          .stop()
          .timeout(10000, 'Waited for ' + browser + ' to quit for too long');
      });
    });
  });
});
