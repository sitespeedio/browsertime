import { getLogger } from '@sitespeed.io/log';
import {
  start as throttleStart,
  stop as throttleStop
} from '@sitespeed.io/throttle';
const log = getLogger('browsertime.connectivity');
import { Humble } from './humble.js';
import { parseTrafficShapeConfig } from './trafficShapeParser.js';
import { getProperty } from '../support/util.js';

let humble;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function addConnectivity(options) {
  const profile = parseTrafficShapeConfig(options);
  if (!profile) {
    return;
  }

  const connectivity = options.connectivity;
  switch (connectivity.engine) {
    case 'external': {
      return;
    }
    case 'throttle': {
      if (options.docker) {
        if (options.connectivity && options.connectivity.profile) {
          log.info(
            'Setting connectivity profile %s',
            options.connectivity.profile
          );
        }
      } else {
        // The log message is confusing if you run in Docker since
        // there's nothing you can do about it
        if (options.connectivity && options.connectivity.profile) {
          log.info(
            'Changing network interfaces needs sudo rights. Setting connectivity profile %s',
            options.connectivity.profile
          );
        } else {
          log.info('Changing network interfaces needs sudo rights.');
        }
      }

      const setOnLocalHost = getProperty(
        connectivity,
        'throttle.localhost',
        false
      );
      const rtt = profile.variance
        ? getRandomIntInclusive(
            profile.rtt,
            Math.ceil(profile.rtt * (profile.variance / 100 + 1))
          )
        : profile.rtt;
      if (profile.variance) {
        log.info(
          'Using random variance %s% setting the latency to %s (configured %s)',
          profile.variance,
          rtt,
          profile.rtt
        );
      }
      return setOnLocalHost
        ? throttleStart({
            localhost: true,
            rtt
          })
        : throttleStart({
            up: profile.up,
            down: profile.down,
            rtt
          });
    }
    case 'humble': {
      humble = new Humble(options);
      return humble.start(profile);
    }
  }
}
export function getConnectivitySettings(options) {
  return parseTrafficShapeConfig(options);
}
export async function removeConnectivity(options) {
  const profile = parseTrafficShapeConfig(options);
  if (!profile) {
    return;
  }

  const connectivity = options.connectivity;
  switch (connectivity.engine) {
    case 'external': {
      return;
    }
    case 'throttle': {
      const setOnLocalHost = getProperty(
        connectivity,
        'throttle.localhost',
        false
      );
      return throttleStop({ localhost: setOnLocalHost });
    }
    case 'humble': {
      return humble.stop();
    }
  }
}
