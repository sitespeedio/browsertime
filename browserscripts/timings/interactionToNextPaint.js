(function () {
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
    return inp.latency;
  } else {
    if (performance.interactionCount > 0) {
      return 0;
    }
  }
})({});
