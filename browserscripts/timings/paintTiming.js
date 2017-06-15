(function() {
  var p = window.performance, entries, values = {};

  entries = p.getEntriesByType('paint');

  if (entries.length > 0) {
    for (var entry of entries) {
      values[entry.name] =  entry.startTime;
    }
    return values;
  }
  else return undefined;
})();
