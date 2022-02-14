const test = require('ava');

let parser = require('../../lib/connectivity/trafficShapeParser');

test(`parseTrafficShapeConfig`, async t => {
  let profiles = parser.getProfiles();

  Object.keys(profiles).forEach(function (name) {
    const profile = profiles[name];
    const shapeConfig = parser.parseTrafficShapeConfig({
      connectivity: { profile: name }
    });
    t.deepEqual(shapeConfig, profile, 'should return profile for ' + name);
  });

  let shapeConfig = parser.parseTrafficShapeConfig({
    connectivity: { profile: 'native' }
  });
  t.is(
    shapeConfig,
    null,
    'should return null for "native" traffic shape config'
  );

  shapeConfig = parser.parseTrafficShapeConfig({});
  t.is(
    shapeConfig,
    null,
    'should return undefined if traffic shape config is missing'
  );
});
