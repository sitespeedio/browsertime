'use strict';

const visualMetrics = require('./visualMetrics'),
    ffmpegRecorder = require('./ffmpegRecorder'),
    log = require('intel'),
    Promise = require('bluebird'),
    fs = require('fs'),
    ffprobe = require('./ffprobe'),
    findFirstFrame = require('./findFirstFrame').get,
    ffmpegRemoveOrangeAndAddTimer = require('./ffmpegRemoveOrangeAndAddTimer').run,
    path = require('path');

Promise.promisifyAll(fs);
const mkdirp = Promise.promisify(require('mkdirp'));

module.exports = {
    run(context) {
        const taskData = context.taskData;
        const imageDir = path.join(taskData.dataDir, 'images', '' + context.index);
        const tmpFile = path.join(context.taskData.dataDir, 'tmp.mp4');
        return ffmpegRecorder.stopRecording(taskData.ffmpeg)
            .tap(() => {
                delete taskData.ffmpeg;
            })
            .tap(() => mkdirp(imageDir))
            .then((recording) => {
                return visualMetrics.run(recording.filePath, imageDir)
                    .then((metrics) => {
                        context.results.visualMetrics = metrics;
                    }).
                then(() => {
                    if (context.options.experimental.removeVideo) {
                        return fs.unlinkAsync(recording.filePath);
                    } else {
                        return ffprobe.run(recording.filePath).then((ffProbeJson) => {
                            const firstFrame = findFirstFrame(ffProbeJson);
                            // the new start is the frame number divided by frames per second
                            const newStart = firstFrame / 60;
                            log.verbose('FirstFrame: %s newStart: %s', firstFrame, newStart);
                            return ffmpegRemoveOrangeAndAddTimer(recording.filePath, newStart, tmpFile, context.results.visualMetrics, context.options);
                        }).then(() => fs.renameAsync(tmpFile, recording.filePath));
                    }
                });
            })
    }
};
