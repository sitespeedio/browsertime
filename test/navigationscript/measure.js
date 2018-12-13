module.exports = {
  run(context, help) {
    return context.runWithDriver(async function() {
      context.log.info('Running script navigation');
      return help.measure('https://www.sitespeed.io/');
    });
  }
};
