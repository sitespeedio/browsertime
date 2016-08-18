'use strict';

module.exports = {
  toArray(arrayLike) {
    if (arrayLike == null) {
      return [];
    }
    if (Array.isArray(arrayLike)) {
      return arrayLike;
    }
    return [arrayLike];
  },
  isEmpty(o) {
    if (o === null || o === undefined)
      return true;

    if (typeof o === 'object')
      return Object.keys(o).length === 0;

    if (typeof o === 'string')
      return o.length === 0;

    return false;
  }
};
