module.exports = async function(context) {
  context.log.info('Running script navigation');
  return context.measure.startAndNavigate('https://www.sitespeed.io/');
};
