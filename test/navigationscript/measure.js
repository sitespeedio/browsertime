module.exports = async function(context, commands) {
  context.log.info('Running script navigation');
  return commands.measure.startAndNavigate('https://www.sitespeed.io/');
};
