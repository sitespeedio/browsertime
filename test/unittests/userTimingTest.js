const test = require('ava');
const path = require('path');
const userTiming = require('../../lib/support/userTiming');
const fs = require('fs');

const timingsFile = path.resolve(__dirname, '..', 'data', 'timings.json');

test(`Filter white listed user timings`, async t => {
  const userTimings = JSON.parse(fs.readFileSync(timingsFile, 'utf-8')).timings
    .userTimings;
  userTiming.filterWhitelisted(userTimings, 'foo_');
  t.deepEqual(
    JSON.stringify(userTimings.marks),
    '[{"name":"foo_test","startTime":"1500.111"},{"name":"foo_test2","startTime":"1100.111"}]'
  );

  t.deepEqual(
    JSON.stringify(userTimings.measures),
    '[{"name":"foo_test3","startTime":"1500.111"},{"name":"foo_test4","startTime":"1100.111"}]'
  );
});
