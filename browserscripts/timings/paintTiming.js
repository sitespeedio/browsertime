(function() {
  var p = window.performance, entries, values = {};

  entries = p.getEntriesByType('paint');

  if (entries.length > 0) {
    for (var entry of entries) {
      values[entry.name] = {startTime: entry.startTime, duration: entry.duration};
    }
    return values;
  }
  else return undefined;
})();
