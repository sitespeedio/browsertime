function docWidth(doc) {
	var body = doc.body, docelem = doc.documentElement;
	var width = Math.max( body.scrollWidth, body.offsetWidth, docelem.clientWidth, docelem.scrollWidth, docelem.offsetWidth );
	return width;
}

return docWidth(document);
