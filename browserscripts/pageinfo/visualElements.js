(function(custom) {
  /**
   * Collect visual elements from a page and feed the size back in the
   * format for Visual Metrics.
   */

  const elementByType = {};
  const areaByType = {};
  const imageTags = [].slice.call(document.body.getElementsByTagName('img'));
  const h1Tags = [].slice.call(document.body.getElementsByTagName('h1'));
  const elementTimings = [].slice.call(
    document.querySelectorAll('[elementtiming]')
  );

  // When we feed options from the CLI it can be a String or an
  // Array with Strings. Make it easy to treat everything the same.
  function toArray(arrayLike) {
    if (arrayLike === undefined || arrayLike === null) {
      return [];
    }
    if (Array.isArray(arrayLike)) {
      return arrayLike;
    }
    return [arrayLike];
  }

  function isLargest(type, area) {
    if (!areaByType[type]) {
      return true;
    } else return areaByType[type] < area;
  }

  function isElementPartlyInViewportAndVisible(el) {
    const rect = el.getBoundingClientRect();
    return !(
      rect.bottom < 0 ||
      rect.right < 0 ||
      rect.left > window.innerWidth ||
      rect.top > window.innerHeight ||
      rect.height === 0
    );
  }

  function visibleArea(el) {
    const rect = el.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    // TODO make this more readable
    const width =
      rect.left < 0
        ? rect.width + rect.left
        : viewportWidth < rect.left + rect.width
        ? viewportWidth - rect.left
        : rect.width;
    const height =
      rect.top < 0
        ? rect.height + rect.top
        : viewportHeight < rect.top + rect.height
        ? viewportHeight - rect.top
        : rect.height;

    return width * height;
  }

  function keepLargestElementByType(type, element) {
    const area = visibleArea(element);
    if (isLargest(type, area)) {
      const filename = element.src
        ? element.src.substring(element.src.lastIndexOf('/') + 1)
        : undefined;
      const rect = element.getBoundingClientRect();
      const tag = element.cloneNode(false);

      elementByType[type] = {
        name: type,
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        filename,
        html: tag.outerHTML
      };
      areaByType[type] = area;
    }
  }

  if (custom) {
    // Input could be a String or an Array of Strings so convert it
    const customArray = toArray(custom);
    for (const nameAndSelector of customArray) {
      const parts = nameAndSelector.split(':');
      const type = parts[0];
      const selector = parts[1];
      const element = document.body.querySelector(selector);
      try {
        if (isElementPartlyInViewportAndVisible(element)) {
          keepLargestElementByType(type, element);
        }
      } catch (e) {
        console.log(
          'Could not find matching element for selector:' +
            selector +
            ' using document.body.querySelector. Do that element exist on the page?'
        );
      }
    }
  }

  imageTags.forEach(function(element) {
    if (isElementPartlyInViewportAndVisible(element)) {
      keepLargestElementByType('LargestImage', element);
    }
  });

  h1Tags.forEach(function(element) {
    if (isElementPartlyInViewportAndVisible(element)) {
      keepLargestElementByType('Heading', element);
    }
  });

  elementTimings.forEach(function(element) {
    if (isElementPartlyInViewportAndVisible(element)) {
      keepLargestElementByType(element.getAttribute('elementtiming'), element);
    }
  });

  // If the browser support largest contentful paint, get that element as well
  const supported = PerformanceObserver.supportedEntryTypes;
  if (supported && supported.indexOf('largest-contentful-paint') > -1) {
    const observer = new PerformanceObserver(list => {});
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    const entries = observer.takeRecords();
    if (entries.length > 0) {
      const largestEntry = entries[entries.length - 1];
      // It seems that the API do not alwayas have a elememt
      if (largestEntry.element && isElementPartlyInViewportAndVisible(largestEntry.element)) {
        keepLargestElementByType('LargestContentfulPaint', largestEntry.element);
      }
    }
  }


  // We need to follow the standard for VisualMetrics
  return {
    viewport: {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    },
    // "heroes" :D https://github.com/sitespeedio/logo/blob/main/png/heroes/Pippi-Sitespeed.io.png
    heroes: Object.keys(elementByType).map(function(type) {
      return elementByType[type];
    })
  };
})(arguments[arguments.length - 1]);
