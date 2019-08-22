module.exports = {
  requires: { privilege: true },
	function: function() {
    const { AppConstants } = ChromeUtils.import(
      'resource://gre/modules/AppConstants.jsm'
    );
    return { ...AppConstants };
  }
};
