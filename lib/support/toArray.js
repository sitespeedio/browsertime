'use strict';

module.exports = function toArray(arrayLike) {
  if (arrayLike == null) {
    return [];
  }
  if (Array.isArray(arrayLike)) {
    return arrayLike;
  }
  return [arrayLike];
};
