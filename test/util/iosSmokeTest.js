// Run Browsertime with Safari on the iPhone that is connected with USB and
// check that each iOS feature gives the result we expect.
// Usage: npm run test:ios
// The video test needs QuickTime Player and screen capture, so run it as the
// user that is logged in to the Mac.
import { readFileSync, readdirSync, statSync, mkdtempSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);
const scripts = path.join(root, 'test', 'data', 'iosscripts');
const url = 'https://www.sitespeed.io/';

function files(dir, pattern) {
  return readdirSync(dir, { recursive: true })
    .map(file => path.join(dir, file))
    .filter(file => pattern.test(path.basename(file)));
}

function hasFile(dir, pattern, minSize = 1) {
  return files(dir, pattern).some(file => statSync(file).size >= minSize);
}

function harDocuments(dir) {
  const file = files(dir, /\.har(\.gz)?$/)[0];
  if (!file) {
    return [];
  }
  const content = readFileSync(file);
  const har = JSON.parse(
    file.endsWith('.gz') ? gunzipSync(content) : content.toString()
  );
  return har.log.entries.filter(entry =>
    entry.response.content.mimeType?.includes('text/html')
  );
}

const visualMetrics = (r, runs) =>
  r[0].visualMetrics?.length === runs &&
  r[0].visualMetrics.every(v => v?.FirstVisualChange > 0);

const tests = [
  // www.sitespeed.io sends Cross-Origin-Opener-Policy, so Safari moves the
  // page to a new process when the response arrives.
  {
    name: 'safari-basic',
    args: [url, '-n', '2'],
    check: (r, dir) => ({
      FCP: r[0].browserScripts?.every(
        b => b.timings?.paintTiming?.['first-contentful-paint'] > 0
      ),
      HAR: hasFile(dir, /\.har/),
      'HTML document in HAR': harDocuments(dir).length === 2,
      TTFB: r[0].browserScripts?.every(b => b.timings?.ttfb > 0)
    })
  },
  {
    name: 'safari-basic-without-coop',
    args: ['https://example.com/', '-n', '2'],
    check: (r, dir) => ({
      FCP: r[0].browserScripts?.every(
        b => b.timings?.paintTiming?.['first-contentful-paint'] > 0
      ),
      'HTML document in HAR': harDocuments(dir).length === 2,
      TTFB: r[0].browserScripts?.every(b => b.timings?.ttfb > 0)
    })
  },
  {
    name: 'safari-screenshot',
    args: [url, '-n', '1', '--screenshot'],
    check: (r, dir) => ({ screenshot: hasFile(dir, /^afterPageCompleteCheck/) })
  },
  {
    name: 'safari-journey',
    args: [path.join(scripts, 'journey.mjs')],
    check: (r, dir) => ({
      'two pages': r.length === 2,
      'custom metric': /iPhone/.test(r[1]?.extras?.[0]?.userAgent ?? ''),
      screenshot: hasFile(dir, /^docs-bottom/)
    })
  },
  {
    name: 'safari-response-bodies',
    args: [url, '-n', '1', '--safari.includeResponseBodies', 'html'],
    check: (r, dir) => ({
      'HTML body': harDocuments(dir).some(
        entry => entry.response.content.text?.length > 0
      )
    })
  },
  // Last, because a failed screen capture can break the tests after it.
  {
    name: 'safari-video',
    args: [url, '-n', '2', '--video', '--visualMetrics'],
    check: (r, dir) => ({
      'visual metrics': visualMetrics(r, 2),
      videos: files(dir, /\.mp4$/).length >= 2
    })
  }
];

const resultBase = mkdtempSync(path.join(tmpdir(), 'browsertime-ios-'));
console.log(`Results in ${resultBase}\n`);

let failures = 0;
for (const t of tests) {
  const dir = path.join(resultBase, t.name);
  const start = Date.now();
  const run = await execa(
    'node',
    [
      path.join(root, 'bin', 'browsertime.js'),
      ...t.args,
      '-b',
      'safari',
      '--ios',
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
