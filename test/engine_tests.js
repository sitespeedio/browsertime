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
          'browser': browser,
          'iterations': 2,
          'delay': 17
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
          'browser': browser,
          'iterations': 1,
          'preTask': loadTaskFile('pre-sample.js'),
          'postTask': [loadTaskFile('post-sample.js'), loadTaskFile('post-sample2.js')]
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
