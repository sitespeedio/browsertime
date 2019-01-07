module.exports = async function(context) {
  await context.measure.startAndNavigate('https://www.sitespeed.io');
  await context.measure.startAndNavigate('https://www.sitespeed.io/examples/');
  return context.measure.startAndNavigate(
    'https://www.sitespeed.io/documentation/'
  );
};
