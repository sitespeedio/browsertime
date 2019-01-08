module.exports = async function(context, commands) {
  context.log.info('Running script navigation');
  return commands.measure.start('https://www.sitespeed.io/');
};
