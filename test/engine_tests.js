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
      let scripts = [{
        path: 'foo.js',
        source: '(function () {return "foo";})()'
      }, {
        path: 'fourtytwo.js',
        source: '(function () {return 42;})()'
      }];

      beforeEach(function() {
        engine = new Engine({
          'browser': browser,
          'scripts': scripts,
          'iterations': 2,
          'delay': 17
        });
        return engine.start();
      });

      it('should be able to load a url', function() {
        // somewhat clunky way to ignore generated har data in test.
        let browsertimeData = engine.run('http://httpbin.org/html').then(function(r) {
          return r.browsertimeData;
        });
        return browsertimeData.should.become([{
          'foo': 'foo',
          'fourtytwo': 42
        }, {
          'foo': 'foo',
          'fourtytwo': 42
        }]);
      });

      it('should be able to load multiple urls', function() {
        return engine.run('http://httpbin.org/html')
          .then(function() {
            return engine.run('http://httpbin.org/html');
          }).should.be.fulfilled;
      });

      afterEach(function() {
        return engine
          .stop()
          .timeout(10000, 'Waited for ' + browser + ' to quit for too long');
      });
    });

    describe('#pre/post tasks - ' + browser, function() {
      beforeEach(function() {
        engine = new Engine({
          'browser': browser,
          'iterations': 1,
          'preTask': require(path.resolve(__dirname, 'preposttasks', 'pre-sample.js')),
          'postTask': require(path.resolve(__dirname, 'preposttasks', 'post-sample.js'))

        });
        return engine.start();
      });

      it('should run pre and post tasks', function() {
        return engine.run('http://httpbin.org/html');
      });


      afterEach(function() {
        return engine
          .stop()
          .timeout(10000, 'Waited for ' + browser + ' to quit for too long');
      });
    })
  });
});
