(function() {
  // https://github.com/sitespeedio/browsertime/issues/979#issuecomment-549107350
  if (typeof document.URL === "string") {
    return document.URL;
  } else {
    return window.location.href;
  }
})();
