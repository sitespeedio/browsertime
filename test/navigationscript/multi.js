module.exports = {
  run(context, help) {
    return context.runWithDriver(async function() {
      await help.measure('https://www.sitespeed.io');
      await help.measure('https://www.sitespeed.io/examples/');
      return help.measure('https://www.sitespeed.io/documentation/');
    });
  }
};
