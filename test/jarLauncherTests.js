'use strict';

let Launcher = require('../lib/support/jarLauncher'),
  Promise = require('bluebird'),
  path = require('path'),
  log = require('intel'),
  getport = require('getport');

getport = Promise.promisify(getport);

describe('JarLauncher', function() {
  var launcher;

  beforeEach(() => {
    let jarPath = path.resolve(__dirname, '..', 'vendor', 'bmpwrapper-2.0.0-full.jar');
    launcher = new Launcher({
      'jarPath': jarPath,
      'stderrLogLevel': log.INFO,
      'startupCriteria': {
        'success': {
          'stdout': null,
          'stderr': 'Started SelectChannelConnector'
        },
        'failure': {
          'stdout': null,
          'stderr': 'Exception in thread'
        }
      }
    });
  });

  it('should launch bmp with args', function() {
    return getport()
      .then((port) => launcher.start(['-port', port]))
      .finally(function() {
        return launcher.stop();
      });
  });

  it('should fail if bmp is launched with invalid args', function() {
    return launcher.start(['-port', 'foo'])
      .finally(function() {
        launcher.stop();
      })
      .should.be.rejected;
  });

});
