module.exports = {
  run(context) {
    console.log('In pretask!!!');
    return context.runWithDriver((driver) => {
      driver.get('https://www.sitespeed.io')
        .then(() => {
          return driver.getCurrentUrl();
        })
        .then((url) => {
          console.log('Loaded url: ' + url);
        });
    });
  }
};
