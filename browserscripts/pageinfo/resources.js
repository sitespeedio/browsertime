(function() {
  const resources = window.performance.getEntriesByType('resource');

  let resourceDuration = 0;
  for (let i = 0; i < resources.length; i++) {
    resourceDuration += resources[i].duration;
  }

  return {
    count: Number(resources.length),
    duration: Number(resourceDuration)
  }
})();

