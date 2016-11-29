'use strict';

const execa = require('execa'),
    log = require('intel');

module.exports = {
    run(videoPath, newStart, outputFile, metrics, options) {

        const speedIndex = "drawtext=enable='between(t," + (Number(metrics.SpeedIndex) / 1000) + ",30)':x=(w-tw)/2: y=H-96:fontcolor=white:fontsize=32:box=1:boxcolor=0x000000AA:text='SpeedIndex " + metrics.SpeedIndex + "'";

        const firstVisualChange = "drawtext=enable='between(t," + (Number(metrics.FirstVisualChange) / 1000) + ",30)':x=(w-tw)/2: y=H-132:fontcolor=white:fontsize=32:box=1:boxcolor=0x000000AA:text='firstVisualChange " + metrics.FirstVisualChange;

        let scriptArgs = [
            '-ss', newStart,
            '-i', videoPath,
            '-c:v', 'libx264',
            '-an'
        ];

        if (!options.experimental.video.raw) {
            scriptArgs.push('-vf', "drawtext=timecode='00\\:00\\:00\\:00':rate=60: x=(w-280)/2: y=H-60:fontcolor=white:fontsize=48:box=1:boxcolor=0x000000AA, " + speedIndex + ',' + firstVisualChange)
        }

        scriptArgs.push('-y',
            outputFile
        );

        log.verbose('Running ffmpeg ' + scriptArgs.join(' '));

        return execa('ffmpeg', scriptArgs)
            .then((result) => result);
    }
};
