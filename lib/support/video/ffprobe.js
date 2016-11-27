'use strict';

const execa = require('execa'),
    log = require('intel');


function waitForFFProbe(readableStream) {
    let all = '';
    return new Promise((resolve, reject) => {
        readableStream.on('data', (data) => {
            all = all + data.toString();
            // the last entry from ffprobe is missing the tags = we are finieshed
            // lets see if we can find a more elegant way to handle this is the future
            if (data.toString().indexOf('tags') === -1) {
                return resolve(all);
            }
        });
        readableStream.once('error', reject);
    });
}

module.exports = {
    run(videoPath) {
        // Get the average saturation level of each frame
        const scriptArgs = [
            '-f', 'lavfi',
            '-i', 'movie=' + videoPath + ',signalstats',
            '-show_entries', 'frame_tags=lavfi.signalstats.SATAVG',
            '-v', 'quiet',
            '-print_format', 'json'
        ];

        log.verbose('Running ffprobe ' + scriptArgs.join(' '));

        const ffprobeProcess = execa('ffprobe', scriptArgs);
        return waitForFFProbe(ffprobeProcess.stdout).then((result) => {
            return JSON.parse(result)
        });
    }
};
