'use strict';

module.exports = function(urlOrFunctions) {
  return async function(context) {
    for (let urlOrFunction of urlOrFunctions) {
      if (typeof urlOrFunction === 'function') {
        await urlOrFunction(context);
      } else {
        await context.measure.startAndNavigate(urlOrFunction);
      }
    }
  };
};
