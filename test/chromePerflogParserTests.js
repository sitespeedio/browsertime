'use strict';

let parser = require('../lib/support/chromePerflogParser'),
  assert = require('assert'),
  fs = require('fs'),
  path = require('path');

describe('chrome-perflog-parser', function() {
  describe('#eventFromSeleniumLogEntry', function() {
    it('should parse valid log entries', function() {
      let datadir = path.resolve(__dirname, 'testdata', 'chromehar');
      let perflogFile = path.resolve(datadir, 'perflog.json');

      let perflog = JSON.parse(fs.readFileSync(perflogFile, 'utf-8'));
      for (let logentry of perflog) {
        let event = parser.eventFromSeleniumLogEntry(logentry);
        assert.notEqual(event.message.params, null);
      }
    });
  });

  describe('#harFromEvents', function() {
    it('should make har from valid events', function() {
      let datadir = path.resolve(__dirname, 'testdata', 'chromehar');
      let perflogFile = path.resolve(datadir, 'perflog.json');

      let perflog = JSON.parse(fs.readFileSync(perflogFile, 'utf-8'));
      let events = perflog.map((logentry) => parser.eventFromSeleniumLogEntry(logentry));

      let har = parser.harFromEvents(events);
      assert.equal(har.log.pages.length, 1);
      assert.equal(har.log.entries.length, 48);
    });
  })
});
