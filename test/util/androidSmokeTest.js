// Run Browsertime on the Android phone that is connected with adb and check
// that each Android feature gives the result we expect.
// Usage: npm run test:android -- [--browser chrome|firefox] [--rooted]
// --rooted also tests --android.rooted, which changes CPU, GPU and kernel
// settings on the phone until it reboots.
import { readFileSync, readdirSync, statSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);
const scripts = path.join(root, 'test', 'data', 'androidscripts');
const url = 'https://www.sitespeed.io/';
const argv = process.argv.slice(2);
const onlyBrowser = argv.includes('--browser')
  ? argv[argv.indexOf('--browser') + 1]
  : undefined;
const rooted = argv.includes('--rooted');

function files(dir, pattern) {
  return readdirSync(dir, { recursive: true })
    .map(file => path.join(dir, file))
    .filter(file => pattern.test(path.basename(file)));
}

function hasFile(dir, pattern, minSize = 1) {
  return files(dir, pattern).some(file => statSync(file).size >= minSize);
}

const visualMetrics = (r, runs) =>
  r[0].visualMetrics?.length === runs &&
  r[0].visualMetrics.every(v => v?.FirstVisualChange > 0);

const journey = r => ({
  'two pages': r.length === 2,
  'custom metric': Boolean(r[1]?.extras?.[0]?.phoneModel)
});

const tests = [
  {
    name: 'chrome-video',
    args: [url, '-b', 'chrome', '-n', '2', '--video', '--visualMetrics'],
    check: (r, dir) => ({
      'visual metrics': visualMetrics(r, 2),
      videos: files(dir, /\.mp4$/).length >= 2,
      HAR: hasFile(dir, /\.har/)
    })
  },
  {
    name: 'chrome-cpu',
    args: [url, '-b', 'chrome', '--cpu'],
    check: (r, dir) => ({
      'cpu data': Boolean(r[0].cpu),
      trace: hasFile(dir, /trace/)
    })
  },
  {
    name: 'chrome-netlog',
    // A netlog from an earlier test on the phone must not make this pass.
    before: 'rm -f /data/local/tmp/chromeNetlog.json',
    args: [url, '-b', 'chrome', '--chrome.collectNetLog'],
    check: (r, dir) => ({ netlog: hasFile(dir, /chromeNetlog/, 1000) })
  },
  {
    name: 'chrome-trace-screenshots',
    args: [
      url,
      '-b',
      'chrome',
      '--chrome.timeline',
      '--chrome.enableTraceScreenshots'
    ],
    check: (r, dir) => ({ trace: hasFile(dir, /trace/) })
  },
  {
    name: 'chrome-cpu-throttling',
    args: [url, '-b', 'chrome', '--chrome.CPUThrottlingRate', '4'],
    check: r => ({ result: Boolean(r[0].browserScripts?.[0]) })
  },
  {
    name: 'chrome-journey',
    args: [path.join(scripts, 'journey.mjs'), '-b', 'chrome'],
    check: (r, dir) => ({
      ...journey(r),
      screenshot: hasFile(dir, /^docs-bottom/)
    })
  },
  {
    name: 'chrome-perfetto',
    args: [path.join(scripts, 'perfetto.mjs'), '-b', 'chrome'],
    check: (r, dir) => ({ trace: hasFile(dir, /^trace\.perfetto$/) })
  },
  {
    name: 'chrome-pretest',
    args: [
      url,
      '-b',
      'chrome',
      '--android.pretestPressHomeButton',
      '--android.pretestPowerPress',
      '--android.verifyNetwork'
    ],
    check: r => ({ result: Boolean(r[0].browserScripts?.[0]) })
  },
  {
    name: 'chrome-battery-temperature',
    args: [
      url,
      '-b',
      'chrome',
      '--android.batteryTemperatureLimit',
      '45',
      '--android.batteryTemperatureWaitTimeInSeconds',
      '30'
    ],
    check: r => ({
      'battery temperature': JSON.stringify(r[0]).includes('batteryTemperature')
    })
  },
  {
    name: 'firefox-video',
    args: [url, '-b', 'firefox', '-n', '2', '--video', '--visualMetrics'],
    check: (r, dir) => ({
      'visual metrics': visualMetrics(r, 2),
      videos: files(dir, /\.mp4$/).length >= 2,
      HAR: hasFile(dir, /\.har/)
    })
  },
  {
    name: 'firefox-window-recorder',
    args: [
      url,
      '-b',
      'firefox',
      '--video',
      '--visualMetrics',
      '--firefox.windowRecorder'
    ],
    check: (r, dir) => ({
      'visual metrics': visualMetrics(r, 1),
      video: hasFile(dir, /\.mp4$/)
    })
  },
  {
    name: 'firefox-gecko-profiler',
    args: [url, '-b', 'firefox', '--firefox.geckoProfiler'],
    check: (r, dir) => ({ profile: hasFile(dir, /^geckoProfile/) })
  },
  {
    name: 'firefox-memory-report',
    args: [url, '-b', 'firefox', '--firefox.memoryReport'],
    check: (r, dir) => ({ report: hasFile(dir, /^memory-report/) })
  },
  {
    name: 'firefox-perfstats',
    args: [url, '-b', 'firefox', '--firefox.perfStats'],
    check: r => ({ perfStats: Boolean(r[0].geckoPerfStats?.length) })
  },
  {
    name: 'firefox-moz-log',
    args: [url, '-b', 'firefox', '--firefox.collectMozLog'],
    check: (r, dir) => ({ 'moz log': hasFile(dir, /moz_log/, 1000) })
  },
  {
    name: 'firefox-journey',
    args: [path.join(scripts, 'journey.mjs'), '-b', 'firefox'],
    check: (r, dir) => ({
      ...journey(r),
      screenshot: hasFile(dir, /^docs-bottom/)
    })
  },
  {
    name: 'firefox-perfetto',
    args: [path.join(scripts, 'perfetto.mjs'), '-b', 'firefox'],
    check: (r, dir) => ({ trace: hasFile(dir, /^trace\.perfetto$/) })
  },
  {
    name: 'chrome-rooted',
    rooted: true,
    args: [
      url,
      '-b',
      'chrome',
      '--android.rooted',
      '--android.pinCPUSpeed',
      'min'
    ],
    check: r => ({ result: Boolean(r[0].browserScripts?.[0]) })
  },
  {
    name: 'firefox-rooted',
    rooted: true,
    args: [
      url,
      '-b',
      'firefox',
      '--android.rooted',
      '--android.pinCPUSpeed',
      'middle'
    ],
    check: r => ({ result: Boolean(r[0].browserScripts?.[0]) })
  }
].filter(
  t => (!onlyBrowser || t.args.includes(onlyBrowser)) && (!t.rooted || rooted)
);

const resultBase = mkdtempSync(path.join(tmpdir(), 'browsertime-android-'));
console.log(`Results in ${resultBase}\n`);

let failures = 0;
for (const t of tests) {
  const dir = path.join(resultBase, t.name);
  const start = Date.now();
  if (t.before) {
    await execa('adb', ['shell', t.before]);
  }
  const run = await execa(
    'node',
    [
      path.join(root, 'bin', 'browsertime.js'),
      ...t.args,
      '--android',
      '--resultDir',
      dir
    ],
    { reject: false, all: true }
  );
  const errors = run.all.split('\n').filter(line => line.includes(' ERROR: '));
  let checks;
  try {
    const result = JSON.parse(readFileSync(path.join(dir, 'browsertime.json')));
    checks = t.check(result, dir);
  } catch (error) {
    checks = { 'browsertime.json': false, [error.message]: false };
  }
  const passed =
    run.exitCode === 0 &&
    errors.length === 0 &&
    Object.values(checks).every(Boolean);
  if (!passed) failures++;
  const seconds = Math.round((Date.now() - start) / 1000);
  const summary = Object.entries(checks)
    .map(([name, ok]) => `${name} ${ok ? 'ok' : 'MISSING'}`)
    .join(', ');
  console.log(`${passed ? 'PASS' : 'FAIL'} ${t.name} (${seconds}s) ${summary}`);
  for (const error of errors.slice(0, 3)) {
    console.log(`     ${error.slice(error.indexOf('ERROR'), 220)}`);
  }
}

console.log(`\n${tests.length - failures} of ${tests.length} passed`);
process.exitCode = failures > 0 ? 1 : 0;
