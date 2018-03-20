'use strict';

const fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird'),
  execa = require('execa');

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

module.exports = {
  async parseCpuTrace(tracelog, dir, no) {
    const tmpFile = path.join(dir, `tmp-${no}.json`);
    const cpuOutputFile = path.join(dir, `cpu-${no}.json`);
    const scriptArgs = ['-t', tmpFile, '-c', cpuOutputFile];

    const categories = {
      Painting: 0,
      Loading: 0,
      Layout: 0,
      Scripting: 0
    };
    const events = {};
    // To get this to work we:
    // Store the trace log file to disk
    // Let the trace-parser script parse the file to a new file
    // Read the new file and parse what we need to JSON
    // And then remove the tmp files.
    return fs.writeFileAsync(tmpFile, JSON.stringify(tracelog)).then(() => {
      return execa(SCRIPT_PATH, scriptArgs).then(() => {
        return fs
          .readFileAsync(cpuOutputFile)
          .then(cpu => {
            const jsonTrace = JSON.parse(cpu);
            const mainThread = jsonTrace.main_thread;
            const mainThreadTimings = jsonTrace.slices[mainThread];

            for (const key of Object.keys(mainThreadTimings)) {
              let total = 0;
              for (const val of mainThreadTimings[key]) {
                total = total + val;
              }
              const type = mapTimings[key];
              if (type) {
                categories[type] = categories[type] + total / 1000;
                events[key] = total / 1000;
              }
            }
            return { categories, events };
          })
          .tap(() => {
            fs.unlinkAsync(tmpFile).then(() => fs.unlinkAsync(cpuOutputFile));
          })
          .tap(result => result);
      });
    });
  }
};
