(function() {
  function docWidth(doc) {
    var body = doc.body, docelem = doc.documentElement;
    return Math.max(body.scrollWidth, body.offsetWidth, docelem.clientWidth, docelem.scrollWidth, docelem.offsetWidth);
  }

  return docWidth(document);
})();
