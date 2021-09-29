'use strict';

const ClickAndHold = require('./mouse/clickAndHold');
const SingleClick = require('./mouse/singleClick');
const DoubleClick = require('./mouse/doubleClick');
const ContextClick = require('./mouse/contextClick');
const MouseMove = require('./mouse/mouseMove');

module.exports = {
  SingleClick,
  DoubleClick,
  ClickAndHold,
  ContextClick,
  MouseMove
};
