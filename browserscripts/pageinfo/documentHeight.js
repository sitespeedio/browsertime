(function() {
  function docHeight(doc) {
    const body = doc.body,
      docelem = doc.documentElement;
    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      docelem.clientHeight,
      docelem.scrollHeight,
      docelem.offsetHeight
    );
  }

  return docHeight(document);
})();
