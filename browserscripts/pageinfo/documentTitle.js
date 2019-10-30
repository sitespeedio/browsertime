(function() {
  // https://github.com/sitespeedio/browsertime/issues/979
  if (typeof document.title === "string") {
    return document.title;
  } else {
    const titles = document.getElementsByTagName("title");
    if (titles.length > 0) {
      return titles[0].innerHTML;
    } else return "";
  }
})();
