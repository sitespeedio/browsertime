'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const execa = require('execa');
const log = require('intel');

Promise.promisifyAll(fs);

const SCRIPT_PATH = path.join(
  __dirname,
  '..',
  '..',
  'vendor',
  'trace_parser.py'
);

//  This is the same way as WPT categorize the events
// https://github.com/WPO-Foundation/webpagetest/blob/master/www/breakdownTimeline.php#L56
// And we been doing the same with
// https://github.com/wikimedia/wpt-reporter/blob/master/lib/cpuTime.js#L10-L13

const mapTimings = {
  EvaluateScript: 'Scripting',
  'v8.compile': 'Scripting',
  FunctionCall: 'Scripting',
  GCEvent: 'Scripting',
  TimerFire: 'Scripting',
  EventDispatch: 'Scripting',
  TimerInstall: 'Scripting',
  TimerRemove: 'Scripting',
  XHRLoad: 'Scripting',
  XHRReadyStateChange: 'Scripting',
  MinorGC: 'Scripting',
  MajorGC: 'Scripting',
  BlinkGCMarking: 'Scripting',
  FireAnimationFrame: 'Scripting',
  'ThreadState::completeSweep': 'Scripting',
  'Heap::collectGarbage': 'Scripting',
  'ThreadState::performIdleLazySweep': 'Scripting',
  Layout: 'Layout',
  UpdateLayoutTree: 'Layout',
  RecalculateStyles: 'Layout',
  ParseAuthorStyleSheet: 'Layout',
  ScheduleStyleRecalculation: 'Layout',
  InvalidateLayout: 'Layout',
  Paint: 'Painting',
  DecodeImag: 'Painting',
  'Decode Image': 'Painting',
  ResizeImage: 'Painting',
  CompositeLayers: 'Painting',
  Rasterize: 'Painting',
  PaintImage: 'Painting',
  PaintSetup: 'Painting',
  ImageDecodeTask: 'Painting',
  GPUTask: 'Painting',
  SetLayerTreeId: 'Painting',
  layerId: 'Painting',
  UpdateLayer: 'Painting',
  UpdateLayerTree: 'Painting',
  'Draw LazyPixelRef': 'Painting',
  'Decode LazyPixelRef': 'Painting',
  ParseHTML: 'Loading',
  ResourceReceivedData: 'Loading',
  ResourceReceiveResponse: 'Loading',
  ResourceSendRequest: 'Loading',
  ResourceFinish: 'Loading',
  CommitLoad: 'Loading',
  Idle: 'Idle'
};

async function deleteIfPossible(file) {
  try {
    return fs.unlinkAsync(file);
  } catch (e) {
    log.warning(e);
  }
}

module.exports = {
  async parseCpuTrace(tracelog, dir, no) {
    // To get this to work we:
    // Store the trace log file to disk
    // Let the trace-parser script parse the file to a new file
    // Read the new file and parse what we need to JSON
    // And then remove the tmp files.
    const tmpFile = path.join(dir, `tmp-${no}.json`);
    const cpuOutputFile = path.join(dir, `cpu-${no}.json`);

    let cpu;

    try {
      await fs.writeFileAsync(tmpFile, JSON.stringify(tracelog));
      await execa(SCRIPT_PATH, ['-t', tmpFile, '-c', cpuOutputFile]);
      cpu = await fs.readFileAsync(cpuOutputFile);
    } finally {
      await deleteIfPossible(tmpFile);
      await deleteIfPossible(cpuOutputFile);
    }

    const { main_thread, slices } = JSON.parse(cpu);
    const mainThreadTimings = slices[main_thread];

    const events = {};
    const categories = {
      Painting: 0,
      Loading: 0,
      Layout: 0,
      Scripting: 0
    };

    for (const [eventName, samples] of Object.entries(mainThreadTimings)) {
      let milliSeconds = samples.reduce((sum, time) => sum + time) / 1e3;

      const type = mapTimings[eventName];
      if (type) {
        categories[type] += milliSeconds;
        events[eventName] = milliSeconds;
      }
    }

    return { categories, events };
  }
};
