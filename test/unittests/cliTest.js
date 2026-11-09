import test from 'ava';
import { parseCommandLine } from '../../lib/support/cli.js';

test.serial('Raise the timeouts in debug mode', t => {
  const argv = process.argv;
  process.argv = [
    'node',
    'browsertime.js',
    '--debug',
    'https://www.sitespeed.io'
  ];
  try {
    const { options } = parseCommandLine();
    t.is(options.timeouts.pageLoad, 2_147_483_647);
    t.is(options.timeouts.script, 2_147_483_647);
    t.is(options.timeouts.pageCompleteCheck, 2_147_483_647);
  } finally {
    process.argv = argv;
  }
});

test.serial('Run Samsung Internet with -b samsung on Android', t => {
  const argv = process.argv;
  process.argv = [
    'node',
    'browsertime.js',
    '--android',
    '-b',
    'samsung',
    'https://www.sitespeed.io'
  ];
  try {
    const { options } = parseCommandLine();
    t.is(options.browser, 'chrome');
    t.is(options.chrome.android.package, 'com.sec.android.app.sbrowser');
  } finally {
    process.argv = argv;
  }
});
