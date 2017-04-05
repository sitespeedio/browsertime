'use strict';

const execa = require('execa'),
    log = require('intel').getLogger('browsertime.video');

module.exports = {
    run(videoPath, newStart, outputFile, metrics, options) {

        let extras = '';
        // we only add SpeedIndex and other metrics if we run VisualMetrics
        if (options.speedIndex) {
            const speedIndex = `drawtext=enable='between(t,${Number(metrics.SpeedIndex) / 1000},30)':x=(w-tw)/2: y=H-124:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='SpeedIndex ${metrics.SpeedIndex}'`;

            const firstVisualChange = `drawtext=enable='between(t,${Number(metrics.FirstVisualChange) / 1000},30)':x=(w-tw)/2: y=H-180:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='FirstVisualChange ${metrics.FirstVisualChange}'`;

            const visualComplete85 = `drawtext=enable='between(t,${Number(metrics.VisualComplete85) / 1000},30)':x=(w-tw)/2: y=H-152:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='VisualComplete85 ${metrics.VisualComplete85}'`;

            const lastVisualChange = `drawtext=enable='between(t,${Number(metrics.LastVisualChange) / 1000},30)':x=(w-tw)/2: y=H-96:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='LastVisualChange ${metrics.LastVisualChange}'`;

            extras = `,${speedIndex}, ${lastVisualChange}, ${visualComplete85}, ${firstVisualChange}`;
        }

        let scriptArgs = [
            '-ss', newStart,
            '-i', videoPath,
            '-c:v', 'libx264',
            '-an'
        ];

        if (!options.videoRaw) {
            scriptArgs.push('-vf', `drawtext=timecode='00\\:00\\:00\\:00':rate=60: x=(w-280)/2: y=H-60:fontcolor=white:fontsize=48:box=1:boxcolor=0x000000AA${extras}`)
        }

        scriptArgs.push('-y',
            outputFile
        );

        log.verbose('Running ffmpeg ' + scriptArgs.join(' '));

        return execa('ffmpeg', scriptArgs)
            .then((result) => result);
    }
};
