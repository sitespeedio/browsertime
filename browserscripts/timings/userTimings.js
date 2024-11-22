(function() {
  const measures = [];
  const marks = [];

  if (window.performance && window.performance.getEntriesByType) {
    const myMarks = Array.prototype.slice.call(
      window.performance.getEntriesByType('mark')
    );

    for (const mark of myMarks) {
      if (mark.detail && mark.detail.devtools) {
        continue;
      } else {
        marks.push({
          name: mark.name,
          startTime: mark.startTime
        });
      }
    }

    const myMeasures = Array.prototype.slice.call(
      window.performance.getEntriesByType('measure')
    );

    for (const measure of myMeasures) {
      if (measure.detail && measure.detail.devtools) {
        continue;
      } else {
        measures.push({
          name: measure.name,
          duration: measure.duration,
          startTime: measure.startTime
        });
      }
    }
  }

  return {
    marks: marks,
    measures: measures
  };
})();
