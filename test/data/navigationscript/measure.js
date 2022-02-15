module.exports = async function (context, commands) {
  context.log.info('Running script navigation');
  return commands.measure.start('http://127.0.0.1:3000/simple/');
};
