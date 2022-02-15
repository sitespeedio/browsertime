async function setUp(context) {
  context.log.info('setUp example!');
}

async function test(context, commands) {
  context.log.info('Test with setUp/tearDown example!');
  return commands.measure.start('http://127.0.0.1:3000/simple/');
}

async function tearDown(context) {
  context.log.info('tearDown example!');
}

module.exports = {
  setUp: setUp,
  tearDown: tearDown,
  test: test
};
