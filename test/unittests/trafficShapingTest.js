import test from 'ava';

import {
  getProfiles,
  parseTrafficShapeConfig
} from '../../lib/connectivity/trafficShapeParser.js';

test(`parseTrafficShapeConfig`, async t => {
  let profiles = getProfiles();

  for (const name of Object.keys(profiles)) {
    const profile = profiles[name];
    const shapeConfig = parseTrafficShapeConfig({
      connectivity: { profile: name }
    });
    t.deepEqual(shapeConfig, profile, 'should return profile for ' + name);
  }

  let shapeConfig = parseTrafficShapeConfig({
    connectivity: { profile: 'native' }
  });
  t.is(shapeConfig, undefined, 'Return null for "native" traffic shape config');

  shapeConfig = parseTrafficShapeConfig({});
  t.is(
    shapeConfig,
    undefined,
    'Return undefined if traffic shape config is missing'
  );
});
