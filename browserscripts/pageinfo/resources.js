(function () {
  const resources = window.performance.getEntriesByType('resource');

  let resourceDuration = 0;
  let servedFromCache = 0;
  let servedFromCacheSupported = false;
  for (let i = 0; i < resources.length; i++) {
    resourceDuration += resources[i].duration;
    if (resources[i].deliveryType !== undefined) {
      servedFromCacheSupported = true;
      if (resources[i].deliveryType === 'cache') {
        servedFromCache++;
      }
    }
  }

  const info = {
    count: Number(resources.length),
    duration: Number(resourceDuration),
  };

  if (servedFromCacheSupported === true) {   
    info.servedFromCache = Number(servedFromCache);
  }

  return info;
})();