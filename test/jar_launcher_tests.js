'use strict';

let Launcher = require('../lib/support/jar_launcher'),
  path = require('path'),
  log = require('intel');

describe('JarLauncher', function() {
  it('should launch bmp with args', function() {
    let jarPath = path.resolve(__dirname, '..', 'vendor', 'bmpwrapper-2.0.0-full.jar');
    let launcher = new Launcher({
      'jarPath': jarPath,
      'stderrLogLevel': log.INFO,
      'startupCriteria': {
        'success': {
          'stdout': null,
          'stderr': null
        },
        'failure': {
          'stdout': null,
          'stderr': null
        }
      }
    });

    return launcher.start(['-port', 8080])
      .delay(5000)
      .finally(function() {
        launcher.stop();
      });
  });
});
