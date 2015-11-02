module.exports = {
  run(context) {
    console.log('In pretask!!!');
    if (!context.taskData.loadedSitespeed) {
      return context.runWithDriver((driver) => {
          return driver.get('https://www.sitespeed.io')
            .then(() => driver.getTitle())
            .then((title) => {
              console.log('Loaded page with title: ' + title);
            });
        })
        .then(() => {
          context.taskData.loadedSitespeed = true;
        });
    }
  }
};
