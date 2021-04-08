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
    if (!supported || supported.indexOf('layout-shift') === -1) {
      return;
    }
    // See https://web.dev/layout-instability-api
    const observer = new PerformanceObserver(list => {});
    const entries = [];
    observer.observe({ type: 'layout-shift', buffered: true });
    const list = observer.takeRecords();
    let score = 0;
    for (let entry of list) {
      if (entry.hadRecentInput) {
        continue;
      } 
      const scoreAndHTML = {score: entry.value, html: []};
      for (let source of entry.sources) {
        try {
          const html = getDomPath(source.node);
          scoreAndHTML.html.push(html.join( ' > '));
        }
        catch(e) {}
      }
     entries.push(scoreAndHTML);
    }
    return entries;
  })();
  