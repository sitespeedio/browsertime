'use strict';

const speedline = require('speedline-core');
const log = require('intel').getLogger('browsertime.chrome');
const visualMetricsExtra = require('../../video/postprocessing/visualmetrics/extraMetrics');
const path = require('path');
const images = require('../../support/images');

function pad(n) {
  const extraZeroes = 6 - n.toString().length;
  for (let i = 0; i < extraZeroes; i++) {
    n = '0' + n;
  }
  return n;
}

module.exports = async function(trace, result, index) {
  try {
    const navStart = trace.traceEvents.filter(
      task =>
        task.cat === 'blink.user_timing' && task.name === 'navigationStart'
    );
    navStart.sort(function(a, b) {
      return a.ts - b.ts;
    });
    log.debug('Get Speedline result from the trace');
    const speedlineResult = await speedline(trace.traceEvents, {
      timeOrigin: navStart[0].ts,
      fastMode: true
    });
    log.debug('Got Speedline result.');
    const startTs = speedlineResult.beginning;
    const visualProgress = speedlineResult.frames
      .map(frame => {
        const ts = Math.floor(frame.getTimeStamp() - startTs);
        return `${ts}=${Math.floor(frame.getProgress())}%`;
      })
      .join(', ');

    const visualMetrics = visualMetricsExtra({
      FirstVisualChange: Number(speedlineResult.first.toFixed(0)),
      LastVisualChange: Number(speedlineResult.complete.toFixed(0)),
      SpeedIndex: Number(speedlineResult.speedIndex.toFixed(0)),
      PerceptualSpeedIndex: Number(
        speedlineResult.perceptualSpeedIndex.toFixed(0)
      ),
      VisualProgress: visualProgress
    }).visualMetrics;

    const promises = [];
    for (let frame of speedlineResult.frames) {
      // follow the name standard of Visual Metrics
      // ms_000000.jpg
      const d = new Date(frame.getTimeStamp() - startTs);
      const name = 'ms_' + pad(d.getTime());
      promises.push(
        images.saveJpg(
          name,
          frame.getImage(),
          result.url,
          this.storageManager,
          {
            type: 'jpg',
            jpg: {
              quality: 80
            },
            maxSize: 400
          },
          path.join('filmstrip', index + ''),
          this.options
        )
      );
    }

    await Promise.all(promises);
    return visualMetrics;
  } catch (e) {
    log.error('Could not generate Visual Metrics using SpeedLine', e);
  }
};
