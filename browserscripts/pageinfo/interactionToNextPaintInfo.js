(function () {

  // This is an updated version of
  // https://github.com/GoogleChrome/web-vitals/blob/64f133590fcac72c1bc042bf7b4ab729d7e03316/src/onINP.ts
  // It was reworked the 19/5-2023

  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('event') === -1 ||  supported.indexOf('first-input') === -1) {
    return;
  }
    var observe = function observe(type, callback, opts) {
      try {
        if (PerformanceObserver.supportedEntryTypes.includes(type)) {
          var po = new PerformanceObserver(function (list) {
            Promise.resolve().then(function () {
              callback(list.getEntries());
            });
          });
          po.observe(Object.assign({type: type, buffered: true}, opts || {}));
          return po;
        }
      } catch (e) {}
      return;
    };
    var interactionCountEstimate = 0;
    var minKnownInteractionId = Infinity;
    var maxKnownInteractionId = 0;
    var updateEstimate = function updateEstimate(entries) {
      entries.forEach(function (e) {
        if (e.interactionId) {
          minKnownInteractionId = Math.min(
            minKnownInteractionId,
            e.interactionId
          );
          maxKnownInteractionId = Math.max(
            maxKnownInteractionId,
            e.interactionId
          );
          interactionCountEstimate = maxKnownInteractionId
            ? (maxKnownInteractionId - minKnownInteractionId) / 7 + 1
            : 0;
        }
      });
    };
    var po;
    var getInteractionCount = function getInteractionCount() {
      return po ? interactionCountEstimate : performance.interactionCount || 0;
    };
    var initInteractionCountPolyfill = function initInteractionCountPolyfill() {
      if ('interactionCount' in performance || po) return;
      po = observe('event', updateEstimate, {
        type: 'event',
        buffered: true,
        durationThreshold: 0,
      });
    };
    var prevInteractionCount = 0;
    var getInteractionCountForNavigation =
      function getInteractionCountForNavigation() {
        return getInteractionCount() - prevInteractionCount;
      };
    var MAX_INTERACTIONS_TO_CONSIDER = 10;
    var longestInteractionList = [];
    var longestInteractionMap = {};
    var processEntry = function processEntry(entry) {
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
            entries: [entry],
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
    };
    var estimateP98LongestInteraction = function estimateP98LongestInteraction() {
      var candidateInteractionIndex = Math.min(
        longestInteractionList.length - 1,
        Math.floor(getInteractionCountForNavigation() / 50)
      );
      return longestInteractionList[candidateInteractionIndex];
    };
  
    var opts = {};
    var metric = {};
    initInteractionCountPolyfill();
    var handleEntries = function handleEntries(entries) {
      entries.forEach(function (entry) {
        if (entry.interactionId) {
          processEntry(entry);
        }
        if (entry.entryType === 'first-input') {
          var noMatchingEntry = !longestInteractionList.some(function (
            interaction
          ) {
            return interaction.entries.some(function (prevEntry) {
              return (
                entry.duration === prevEntry.duration &&
                entry.startTime === prevEntry.startTime
              );
            });
          });
          if (noMatchingEntry) {
            processEntry(entry);
          }
        }
      });
      var inp = estimateP98LongestInteraction();
      if (inp && inp.latency !== metric.value) {
        var cleanedEntries = [];
        for (var entry of inp.entries) {
          console.log(entry);
          cleanedEntries.push({ 
            id: entry.interactionId,
            latency: entry.duration,
            name: entry.name
          });
        }
        return {latency: inp.latency, entries: cleanedEntries};
      }
    };
    var po = observe('event', handleEntries, {
      durationThreshold: opts.durationThreshold || 40,
    });
    if (po) {
      po.observe({type: 'first-input', buffered: true});
    }
  })({});
  