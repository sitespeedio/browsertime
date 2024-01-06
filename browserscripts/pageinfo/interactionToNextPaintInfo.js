(function () {
  // https://github.com/GoogleChrome/web-vitals/blob/main/src/lib/getLoadState.ts#L20

  function getLoadState(timestamp) {
    if (document.readyState === 'loading') {
      // If the `readyState` is 'loading' there's no need to look at timestamps
      // since the timestamp has to be the current time or earlier.
      return 'loading';
    } else {
      const navigationEntry = performance.getEntriesByType('navigation')[0];
      if (navigationEntry) {
        if (timestamp < navigationEntry.domInteractive) {
          return 'loading';
        } else if (
          navigationEntry.domContentLoadedEventStart === 0 ||
          timestamp < navigationEntry.domContentLoadedEventStart
        ) {
          // If the `domContentLoadedEventStart` timestamp has not yet been
          // set, or if the given timestamp is less than that value.
          return 'dom-interactive';
        } else if (
          navigationEntry.domComplete === 0 ||
          timestamp < navigationEntry.domComplete
        ) {
          // If the `domComplete` timestamp has not yet been
          // set, or if the given timestamp is less than that value.
          return 'dom-content-loaded';
        }
      }
    }
    // If any of the above fail, default to loaded. This could really only
    // happy if the browser doesn't support the performance timeline, which
    // most likely means this code would never run anyway.
    return 'complete';
  }

  // https://github.com/GoogleChrome/web-vitals/blob/main/src/lib/getSelector.ts#L24
  function getName(node) {
    const name = node.nodeName;
    return node.nodeType === 1
      ? name.toLowerCase()
      : name.toUpperCase().replace(/^#/, '');
  }

  function getSelector(node) {
    let sel = '';

    try {
      while (node && node.nodeType !== 9) {
        const el = node;
        const part = el.id
          ? '#' + el.id
          : getName(el) +
            (el.classList &&
            el.classList.value &&
            el.classList.value.trim() &&
            el.classList.value.trim().length
              ? '.' + el.classList.value.trim().replace(/\s+/g, '.')
              : '');
        if (sel.length + part.length > 100 - 1) return sel || part;
        sel = sel ? part + '>' + sel : part;
        if (el.id) break;
        node = el.parentNode;
      }
    } catch (err) {
      // Do nothing...
    }
    return sel;
  }

  // https://gist.github.com/karlgroves/7544592
  function getDomPath(el) {
    const stack = [];
    while (el.parentNode != null) {
      let sibCount = 0;
      let sibIndex = 0;
      for (let i = 0; i < el.parentNode.childNodes.length; i++) {
        let sib = el.parentNode.childNodes[i];
        if (sib.nodeName == el.nodeName) {
          if (sib === el) {
            sibIndex = sibCount;
          }
          sibCount++;
        }
      }
      if (el.hasAttribute && el.hasAttribute('id') && el.id != '') {
        stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
      } else if (sibCount > 1) {
        stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
      } else {
        stack.unshift(el.nodeName.toLowerCase());
      }
      el = el.parentNode;
    }

    return stack.slice(1);
  }

  // https://github.com/GoogleChrome/web-vitals/blob/main/src/onINP.ts
  const observer = new PerformanceObserver(list => {});
  observer.observe({type: 'event', buffered: true});
  observer.observe({type: 'first-input', buffered: true});
  const entries = observer.takeRecords();

  const MAX_INTERACTIONS_TO_CONSIDER = 10;
  const longestInteractionList = [];
  const longestInteractionMap = {};
  for (let entry of entries) {
    var minLongestInteraction =
      longestInteractionList[longestInteractionList.length - 1];
    var existingInteraction = longestInteractionMap[entry.interactionId];
    if (
      existingInteraction ||
      longestInteractionList.length < MAX_INTERACTIONS_TO_CONSIDER ||
      entry.duration > minLongestInteraction.latency
    ) {
      if (existingInteraction) {
        existingInteraction.entries.push(entry);
        existingInteraction.latency = Math.max(
          existingInteraction.latency,
          entry.duration
        );
      } else {
        var interaction = {
          id: entry.interactionId,
          latency: entry.duration,
          entries: [entry]
        };
        longestInteractionMap[interaction.id] = interaction;
        longestInteractionList.push(interaction);
      }
      longestInteractionList.sort(function (a, b) {
        return b.latency - a.latency;
      });
      longestInteractionList
        .splice(MAX_INTERACTIONS_TO_CONSIDER)
        .forEach(function (i) {
          delete longestInteractionMap[i.id];
        });
    }
  }

  const inp = longestInteractionList[longestInteractionList.length - 1];
  if (inp) {
    const cleanedEntries = [];

    for (let entry of inp.entries) {
      cleanedEntries.push({
        id: entry.interactionId,
        latency: entry.duration,
        name: entry.name
      });
    }

    const longestEntry = inp.entries.sort((a, b) => {
      // Sort by: 1) duration (DESC), then 2) processing time (DESC)
      return (
        b.duration - a.duration ||
        b.processingEnd -
          b.processingStart -
          (a.processingEnd - a.processingStart)
      );
    })[0];
    let element = longestEntry.target;

    return {
      latency: inp.latency,
      entries: cleanedEntries,
      eventType: longestEntry.name,
      eventTime: longestEntry.startTime,
      eventTarget: getSelector(element),
      loadState: getLoadState(longestEntry.startTime),
      domPath: element ? getDomPath(element).join(' > ') : '',
      tagName: element ? element.tagName : '',
      className: element ? element.className : '',
      tag: element ? element.cloneNode(false).outerHTML : ''
    };
  }
})({});
