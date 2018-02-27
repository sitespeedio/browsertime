'use strict';

const startVideoDesktop = require('./desktop/startVideo');
const startVideoAndroid = require('./android/startVideoAndroid');
const stopVideoDesktop = require('./desktop/stopVideo');
const stopVideoAndroid = require('./android/stopVideoAndroid');

module.exports = function getRecorder(isAndroid) {
  if (isAndroid) {
    return {
      start: startVideoAndroid,
      stop: stopVideoAndroid
    };
  } else {
    return {
      start: startVideoDesktop,
      stop: stopVideoDesktop
    };
  }
};
