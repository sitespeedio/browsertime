module.exports = async function(context) {
  context.log.info('Running script navigation');
  return context.h.measure('https://www.sitespeed.io/');
};
