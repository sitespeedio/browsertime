/*eslint no-console: 0*/

// Help-topic dispatch for the Browsertime CLI.
//
// Browsertime declares ~250 options in one big yargs chain, with each
// option carrying an inline `group: '<topic>'` field. The unfiltered
// --help dump is overwhelming; this module lets users say:
//
//   browsertime --help              -> curated set of common options
//   browsertime --help <topic>      -> only that topic
//   browsertime --help-all          -> the full historical dump
//
// We intercept the yargs instance's .option() call to capture each
// key's topic from the inline `group` field, so the cli.js chain
// doesn't have to change shape.

// Curated set of "everyday" options the default --help should show.
// Keep this list short -- anything missing is one --help <topic> away.
const COMMON_KEYS = new Set([
  // common everyday flags
  'browser',
  'b',
  'iterations',
  'n',
  'video',
  'visualMetrics',
  'speedIndex',
  'docker',
  'preURL',
  'headless',
  'connectivity.profile',
  'c',
  'connectivity.engine',
  'mobile',
  'resultDir',
  'cpu',
  // meta
  'config',
  'help',
  'h',
  'verbose',
  'v',
  'version',
  'V'
]);

// Meta-flags that always stay visible regardless of mode.
const ALWAYS_KEEP = new Set([
  'help',
  'h',
  'version',
  'V',
  'config',
  'verbose',
  'v'
]);

const DOCS_URL = 'https://www.sitespeed.io/documentation/browsertime/';

// Parse the raw arg list, detect help intent, and return a cleaned arg
// list with `--help-all` / `--help <topic>` collapsed to a plain
// `--help` so yargs still triggers its normal help+exit flow.
//
// Returns { mode, topic, args } where mode is one of:
//   'none'    -> no --help passed
//   'default' -> plain --help, show the curated common subset
//   'topic'   -> --help <topic>, show only that topic
//   'all'     -> --help-all (or --help all), show everything
export function classifyHelp(rawArgs) {
  const cleaned = [];
  let mode = 'none';
  let topic;
  for (let i = 0; i < rawArgs.length; i++) {
    const a = rawArgs[i];
    if (a === '--help-all') {
      mode = 'all';
      cleaned.push('--help');
      continue;
    }
    if (a === '--help' || a === '-h' || a === '--help=true') {
      const next = rawArgs[i + 1];
      if (next && !next.startsWith('-')) {
        if (next === 'all') {
          mode = 'all';
          i++;
        } else {
          mode = 'topic';
          topic = next;
          i++;
        }
      } else if (mode === 'none') {
        mode = 'default';
      }
      cleaned.push('--help');
      continue;
    }
    cleaned.push(a);
  }
  return { mode, topic, args: cleaned };
}

// Wrap a yargs instance so every subsequent .option(key, def) call also
// records `key` under `def.group` in the returned Map. Browsertime's
// option chain already carries inline `group: '<topic>'` annotations,
// so no chain edits are needed.
export function captureTopics(yargsInstance) {
  const topicKeys = new Map();
  const originalOption = yargsInstance.option.bind(yargsInstance);
  yargsInstance.option = function (key, def) {
    if (def && def.group) {
      const list = topicKeys.get(def.group) || [];
      list.push(key);
      topicKeys.set(def.group, list);
    }
    return originalOption(key, def);
  };
  return topicKeys;
}

// Build the epilog (footer) shown under --help, varying by mode.
export function buildEpilog(mode, topic, topicNames) {
  if (mode === 'all' || mode === 'none') {
    return `Read the docs at ${DOCS_URL}`;
  }
  if (mode === 'topic') {
    return [
      `Showing only the "${topic}" options.`,
      `Run with --help-all for the full reference, or --help to see common options.`,
      `Read the docs at ${DOCS_URL}`
    ].join('\n');
  }
  // default
  const topics = topicNames.join(', ');
  return [
    'Topics (use `browsertime --help <topic>`):',
    '  ' + topics,
    '',
    'Run with --help-all to see every option, or read the docs at ' + DOCS_URL
  ].join('\n');
}

// Apply the topic filter by calling yargs.hide() on every key not in
// the set we want to display. Returns true if filtering was applied.
export function applyHelpFilter(yargsInstance, mode, topic, topicKeys) {
  if (mode === 'none' || mode === 'all') return false;

  let keep;
  if (mode === 'topic') {
    if (!topicKeys.has(topic)) {
      console.error(`Unknown help topic: ${topic}`);
      console.error('Available topics: ' + [...topicKeys.keys()].join(', '));
      // CLI dispatch: bailing out here is intentional (deliberate "no
      // such topic" exit code), not an error to bubble up the stack.
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(2);
    }
    // Topic mode = just the topic. No COMMON_KEYS floor here -- topic
    // views should focus on the topic, not re-render common stuff
    // that's one --help away.
    keep = new Set(topicKeys.get(topic));
  } else {
    // default
    keep = COMMON_KEYS;
  }

  const allKeys = Object.keys(yargsInstance.getOptions().key);
  for (const k of allKeys) {
    if (ALWAYS_KEEP.has(k)) continue;
    if (!keep.has(k)) {
      yargsInstance.hide(k);
    }
  }
  return true;
}
