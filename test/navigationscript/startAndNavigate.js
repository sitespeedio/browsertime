module.exports = {
  run(context, help) {
    return context.runWithDriver(async function() {
      context.log.info('Running script navigation');
      return help.startAndNavigate('https://www.sitespeed.io/');
    });
  }
};
