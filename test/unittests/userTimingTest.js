import test from 'ava';
import { filterAllowlisted } from '../../lib/support/userTiming.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const timingsFile = path.resolve(__dirname, '..', 'data', 'timings.json');

test(`Filter white listed user timings`, async t => {
  const userTimings = JSON.parse(readFileSync(timingsFile, 'utf8')).timings
    .userTimings;
  filterAllowlisted(userTimings, 'foo_');
  t.deepEqual(
    JSON.stringify(userTimings.marks),
    '[{"name":"foo_test","startTime":"1500.111"},{"name":"foo_test2","startTime":"1100.111"}]'
  );

  t.deepEqual(
    JSON.stringify(userTimings.measures),
    '[{"name":"foo_test3","startTime":"1500.111"},{"name":"foo_test4","startTime":"1100.111"}]'
  );
});
