'use strict';

let path = require('path'),
  Engine = require('../lib/core/engine');

let BROWSERS = ['chrome', 'firefox'];

if (process.platform === 'win32') {
  BROWSERS.push('ie');
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
          delay: 17,
          experimental: {
            nativeHar: true
          }
        });
        return engine.start();
      });

      it('should be able to load a url', function() {
        // somewhat clunky way to ignore generated har data in test.
        let browsertimeData = engine.run('http://httpbin.org/html', {scripts})
          .then(function(r) {
            return r.browsertimeData;
          });
        return browsertimeData.should.become([
          {
            scripts: {
              'foo': 'fff',
              'uri': 'http://httpbin.org/html',
              'fourtytwo': 42
            }
          },
          {
            scripts: {
              'foo': 'fff',
              'uri': 'http://httpbin.org/html',
              'fourtytwo': 42
            }
          }]);
      });

      it('should be able to load multiple urls', function() {
        return engine.run('http://httpbin.org/html', {scripts})
          .then(function() {
            return engine.run('http://httpbin.org/html', {scripts});
          }).should.be.fulfilled;
      });

      it('should be able to generate a har', function() {
        // somewhat clunky way to ignore generated har data in test.
        return engine.run('http://httpbin.org/html', {scripts})
          .then(function(r) {
            return r.har.should.have.deep.property('log.entries[0].request.url');
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
        let browsertimeData = engine.run('http://httpbin.org/html', {scripts: syncScripts}, {scripts: asyncScripts})
          .then(function(r) {
            return r.browsertimeData;
          });
        return browsertimeData.should.become([
          {
            scripts: {
              'foo': 'fff',
              'uri': 'http://httpbin.org/html',
              'fourtytwo': 42,
              'promiseFourtyThree': 43
            }
          }]);
      });

      it('should be able to run async fetch script', function() {
        let browsertimeData = engine.run('http://examples.sitespeed.io/3.0/2014-12-15-22-16-30/', null, {
            scripts: {
              stylesheets: `(function() {
            'use strict';

            function getAbsoluteURL(url) {
              var a = window.document.createElement('a');
              a.href = url;
              return a.href;
            }

            if (!window.fetch) {
              return {};
            }

            var request = new Request(document.URL, {
              redirect: 'follow',
              destination: 'document'
            });

            return fetch(request)
              .then(function(response) {
                return response.text();
              })
              .then(function(text) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(text, "text/html");

                var links = Array.prototype.slice.call(doc.head.getElementsByTagName('link'));

                return links.filter(function(link) {
                    return (link.rel === 'stylesheet');
                  })
                  .filter(function(link) {
                    var url = getAbsoluteURL(link.attributes['href'].value);
                    return /^http(s)?:\/\//.test(url);
                  })
                  .map(function(link) {
                    return {
                      href: getAbsoluteURL(link.attributes['href'].value),
                      media: link.media,
                      rel: link.rel
                    };
                  });
              });
          })()`
            }
          })
          .then(function(r) {
            return r.browsertimeData;
          });
        return browsertimeData.should.become([
          {
            scripts: {
              stylesheets: [
                {
                  'href': 'http://examples.sitespeed.io/3.0/2014-12-15-22-16-30/css/bootstrap.min.css',
                  'media': '',
                  'rel': 'stylesheet'
                },
                {
                  'href': 'http://examples.sitespeed.io/3.0/2014-12-15-22-16-30/css/bootstrap-overrides.css',
                  'media': '',
                  'rel': 'stylesheet'
                }
              ]
            }
          }]);
      });

      afterEach(function() {
        return engine
          .stop()
          .timeout(10000, 'Waited for ' + browser + ' to quit for too long');
      });
    });

    describe('#pre/post tasks - ' + browser, function() {
      function loadTaskFile(file) {
        return require(path.resolve(__dirname, 'preposttasks', file))
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
          postTask: [loadTaskFile('postSample.js'), loadTaskFile('postSample2.js')]
        });
        return engine.start();
      });

      it('should run pre and post tasks', function() {
        return engine.run('http://httpbin.org/html', {scripts});
      });


      afterEach(function() {
        return engine
          .stop()
          .timeout(10000, 'Waited for ' + browser + ' to quit for too long');
      });
    })
  });
});
