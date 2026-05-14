import test from 'ava';
import yargs from 'yargs';

import {
  classifyHelp,
  captureTopics,
  applyHelpFilter,
  buildEpilog
} from '../../lib/support/helpTopics.js';

test('classifyHelp recognises a plain --help', t => {
  const result = classifyHelp(['--help']);
  t.is(result.mode, 'default');
  t.deepEqual(result.args, ['--help']);
});

test('classifyHelp recognises --help <topic> and strips the topic', t => {
  const result = classifyHelp(['--help', 'chrome']);
  t.is(result.mode, 'topic');
  t.is(result.topic, 'chrome');
  t.deepEqual(result.args, ['--help']);
});

test('classifyHelp recognises --help-all', t => {
  const result = classifyHelp(['--help-all']);
  t.is(result.mode, 'all');
  t.deepEqual(result.args, ['--help']);
});

test('classifyHelp recognises --help all (space form)', t => {
  const result = classifyHelp(['--help', 'all']);
  t.is(result.mode, 'all');
  t.deepEqual(result.args, ['--help']);
});

test('classifyHelp returns none when --help is not present', t => {
  const result = classifyHelp(['https://example.com', '-n', '5']);
  t.is(result.mode, 'none');
  t.is(result.topic, undefined);
  t.deepEqual(result.args, ['https://example.com', '-n', '5']);
});

test('classifyHelp does not eat the next arg when it looks like a flag', t => {
  const result = classifyHelp(['--help', '--mobile']);
  t.is(result.mode, 'default');
  t.deepEqual(result.args, ['--help', '--mobile']);
});

test('captureTopics records keys under their inline group field', t => {
  const y = yargs([]);
  const topics = captureTopics(y);
  y.option('chrome.foo', { group: 'chrome' })
    .option('chrome.bar', { group: 'chrome' })
    .option('firefox.x', { group: 'firefox' })
    .option('without.group', { describe: 'no group' });
  t.deepEqual(topics.get('chrome'), ['chrome.foo', 'chrome.bar']);
  t.deepEqual(topics.get('firefox'), ['firefox.x']);
  t.false(topics.has('without.group'));
});

test('applyHelpFilter hides everything outside the requested topic', t => {
  const y = yargs([]);
  const topics = captureTopics(y);
  y.option('mobile', { type: 'boolean' })
    .option('config', { type: 'string' })
    .option('chrome.args', { type: 'string', group: 'chrome' })
    .option('s3.bucketname', { type: 'string', group: 's3' });

  applyHelpFilter(y, 'topic', 'chrome', topics);

  const opts = y.getOptions();
  // The requested topic stays.
  t.false(opts.hiddenOptions.includes('chrome.args'));
  // Other topics are hidden.
  t.true(opts.hiddenOptions.includes('s3.bucketname'));
  // Universal meta-flag stays visible.
  t.false(opts.hiddenOptions.includes('config'));
});

test('buildEpilog mentions the topic list in default mode', t => {
  const epilog = buildEpilog('default', undefined, ['chrome', 's3']);
  t.true(epilog.includes('chrome'));
  t.true(epilog.includes('s3'));
});

test('buildEpilog mentions the active topic in topic mode', t => {
  const epilog = buildEpilog('topic', 'chrome', ['chrome']);
  t.true(epilog.includes('chrome'));
  t.true(epilog.includes('--help-all'));
});
