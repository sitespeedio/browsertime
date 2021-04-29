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
    const candidates = [];
    for (let entry of entries) {
        console.log(entry);
        const html = getDomPath(entry.element);
        candidates.push(
            {
                duration: entry.duration,
                id: entry.id,
                url: entry.url,
                loadTime: Number(entry.loadTime.toFixed(0)),
                renderTime: Number(Math.max(entry.renderTime,entry.loadTime).toFixed(0)),
                size: entry.size,
                startTime: Number(entry.startTime.toFixed(0)),
                tagName: entry.element ? entry.element.tagName : '',
                className: entry.element ? entry.element.className : '',
                domPath:  entry.element ? (getDomPath(entry.element)).join( ' > ') : ''
              }

        )
    }
    return candidates;
  })();
  