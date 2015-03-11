function docHeight(doc) {
	var body = doc.body, docelem = doc.documentElement;
	var height = Math.max( body.scrollHeight, body.offsetHeight, docelem.clientHeight, docelem.scrollHeight, docelem.offsetHeight );
	return height;
}

return docHeight(document);
