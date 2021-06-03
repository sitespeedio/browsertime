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
    let max = 0; 
    let current = []; 
    let curr = 0; 
    let firstTs = Number.NEGATIVE_INFINITY; 
    let prevTs = Number.NEGATIVE_INFINITY;
    observer.observe({ type: 'layout-shift', buffered: true });
    const list = observer.takeRecords();
    const maxSessionGap1sLimit5s = {};
    for (let entry of list) {
      if (entry.hadRecentInput) {
        continue;
      } 

      if (entry.startTime - firstTs > 5000 || entry.startTime - prevTs > 1000) {
        firstTs = entry.startTime;
        curr = 0;
        maxSessionGap1sLimit5s[max] = [...current];
        current = []; 
      }
      prevTs = entry.startTime;
      curr += entry.value;
      max = Math.max(max, curr);

      const scoreAndHTML = {score: entry.value, domPath: [], startTime: entry.startTime, tags: []};
      for (let source of entry.sources) {
        try {
          if (source.node) {
            const html = getDomPath(source.node);
            scoreAndHTML.domPath.push(html.join( ' > '));
            const tag = source.node.cloneNode(false);
            scoreAndHTML.tags.push(tag.outerHTML);
          }
        }
        catch(e) {}
      }
      current.push(scoreAndHTML);
      }
    return maxSessionGap1sLimit5s[max] ?  maxSessionGap1sLimit5s[max] : current;
  })();
  