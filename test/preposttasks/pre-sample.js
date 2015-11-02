module.exports = {
  run(context) {
    console.log('In pretask!!!');
    return context.runWithDriver((driver) => {
      return driver.get('https://www.sitespeed.io')
        .then(() => {
          return driver.getTitle();
        })
        .then((title) => {
          console.log('Loaded page with title: ' + title);
        });
    });
  }
};
