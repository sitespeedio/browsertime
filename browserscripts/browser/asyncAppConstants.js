module.exports = {
  requires: { privilege: true },
  function: async function() {
    return new Promise(resolve => {
      const { AppConstants } = ChromeUtils.import(
        'resource://gre/modules/AppConstants.jsm'
      );
      resolve(AppConstants);
    });
  }
};
