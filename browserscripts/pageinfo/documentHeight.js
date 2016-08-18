(function() {
  function docHeight(doc) {
    var body = doc.body, docelem = doc.documentElement;
    return Math.max(body.scrollHeight, body.offsetHeight, docelem.clientHeight, docelem.scrollHeight, docelem.offsetHeight);
  }

  return docHeight(document);
})();
