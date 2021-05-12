(function() {
  // https://gist.github.com/karlgroves/7544592
  function getDomPath(el) {
    const stack = [];
    while ( el.parentNode != null ) {
      let sibCount = 0;
      let sibIndex = 0;
      for ( let i = 0; i < el.parentNode.childNodes.length; i++ ) {
        let sib = el.parentNode.childNodes[i];
        if ( sib.nodeName == el.nodeName ) {
          if ( sib === el ) {
            sibIndex = sibCount;
          }
          sibCount++;
        }
      }
      if ( el.hasAttribute && el.hasAttribute('id') && el.id != '' ) {
        stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
      } else if ( sibCount > 1 ) {
        stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
      } else {
        stack.unshift(el.nodeName.toLowerCase());
      }
      el = el.parentNode;
    }
  
    return stack.slice(1);
  }

  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('largest-contentful-paint') === -1) {
    return;
  }
  const observer = new PerformanceObserver(list => {});
  observer.observe({ type: 'largest-contentful-paint', buffered: true });
  const entries = observer.takeRecords();
  if (entries.length > 0) {
    const largestEntry = entries[entries.length - 1];
    return {
      duration: largestEntry.duration,
      id: largestEntry.id,
      url: largestEntry.url,
      loadTime: Number(largestEntry.loadTime.toFixed(0)),
      renderTime: Number(Math.max(largestEntry.renderTime,largestEntry.loadTime).toFixed(0)),
      size: largestEntry.size,
      startTime: Number(largestEntry.startTime.toFixed(0)),
      tagName: largestEntry.element ? largestEntry.element.tagName : '',
      className :largestEntry.element ? largestEntry.element.className : '',
      domPath:  largestEntry.element ? (getDomPath(largestEntry.element)).join( ' > ') : '',
      tag: largestEntry.element ? (largestEntry.element.cloneNode(false)).outerHTML : ''
    };
  } else return;
})();
