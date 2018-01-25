'use strict';

const TimelineModel = require('devtools-timeline-model');

// This is the work of https://github.com/betit/chrometrace-sitespeedio-plugin

function normalizeActivityName(key) {
  return key.replace(/\s/g, '');
}

function convert(events) {
  const model = new TimelineModel(events);
  const activities = model.bottomUpGroupBy('EventName').children;

  let results = {
    timeline: {
      activity: {},
      category: {}
    }
  };

  for (const [key, value] of activities) {
    results.timeline.activity[normalizeActivityName(key)] = value.totalTime;
  }

  const categories = model.bottomUpGroupBy('Category').children;

  for (const [key, value] of categories) {
    results.timeline.category[normalizeActivityName(key)] = value.totalTime;
  }

  return results;
}

module.exports = convert;
