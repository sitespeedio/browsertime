(function() {
  if (window.performance && window.performance.getEntriesByType) {
    var timings = window.performance.getEntriesByType('resource');
    var resources = [];
    // we can do more cool stuff with resouce timing v2 in the
    // future
    timings.forEach(function(resource) {
        resources.push({
          name: resource.name,
          startTime: resource.startTime,
          duration: resource.duration
        });
    });

  return resources;
  } else {
    return [];
  }
})();
