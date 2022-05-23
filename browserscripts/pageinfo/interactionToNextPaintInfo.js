(function () {
  // This is an updated version of
  // https://github.com/GoogleChrome/web-vitals/blob/next/src/onINP.ts

  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('event') === -1) {
    return;
  }

  const observer = new PerformanceObserver(list => {});
  // Event Timing entries have their durations rounded to the nearest 8ms,
  // so a duration of 40ms would be any event that spans 2.5 or more frames
  // at 60Hz. This threshold is chosen to strike a balance between usefulness
  // and performance. Running this callback for any interaction that spans
  // just one or two frames is likely not worth the insight that could be
  // gained.
  observer.observe({type: 'event', buffered: true, durationThreshold: 40});
  const entries = observer.takeRecords();

  // To prevent unnecessary memory usage on pages with lots of interactions,
  // store at most 10 of the longest interactions to consider as INP candidates.
  const MAX_INTERACTIONS_TO_CONSIDER = 10;

  // A list of longest interactions on the page (by latency) sorted so the
  // longest one is first. The list is as most MAX_INTERACTIONS_TO_CONSIDER long.
  let longestInteractionList = [];

  // A mapping of longest interactions by their interaction ID.
  // This is used for faster lookup.
  const longestInteractionMap = {};

  const getInteractionCountForNavigation = () => {
    // I guess the interactionCount is coming in Chrome later on
    if (performance.interactionCount) {
      return performance.interactionCount;
    } else {
      const observerForAll = new PerformanceObserver(list => {});
      observerForAll.observe({
        type: 'event',
        buffered: true,
        durationThreshold: 0
      });
      const allEntries = observerForAll.takeRecords();
      let interactionCountEstimate = 0;
      let minKnownInteractionId = Infinity;
      let maxKnownInteractionId = 0;

      for (let e of allEntries) {
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
      }
      return interactionCountEstimate;
    }
  };

  const estimateP98LongestInteraction = () => {
    const candidateInteractionIndex = Math.min(
      longestInteractionList.length - 1,
      Math.floor(getInteractionCountForNavigation() / 50)
    );

    return longestInteractionList[candidateInteractionIndex];
  };

  if (entries.length > 0) {
    for (let entry of entries) {
      const minLongestInteraction =
        longestInteractionList[longestInteractionList.length - 1];
      const existingInteraction = longestInteractionMap[entry.interactionId];
      if (
        existingInteraction ||
        longestInteractionList.length < MAX_INTERACTIONS_TO_CONSIDER ||
        entry.duration > minLongestInteraction.latency
      ) {
        // If the interaction already exists, update it. Otherwise create one.
        if (existingInteraction) {
          existingInteraction.entries.push(entry);
          existingInteraction.latency = Math.max(
            existingInteraction.latency,
            entry.duration
          );
        } else {
          const interaction = {
            id: entry.interactionId,
            latency: entry.duration,
            entries: [entry]
          };
          longestInteractionMap[interaction.id] = interaction;
          longestInteractionList.push(interaction);
        }

        // Sort the entries by latency (descending) and keep only the top ten.
        longestInteractionList.sort((a, b) => b.latency - a.latency);
        longestInteractionList
          .splice(MAX_INTERACTIONS_TO_CONSIDER)
          .forEach(i => {
            delete longestInteractionMap[i.id];
          });
      }
    }
    return estimateP98LongestInteraction();
  } else {
    // nothing to report
  }
})();
