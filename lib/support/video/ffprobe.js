'use strict';

const execa = require('execa'),
    log = require('intel');


function waitForFFProbe(readableStream) {
    let all = '';
    return new Promise((resolve, reject) => {
        readableStream.on('data', (data) => {
            // console.log('row:' + data.toString());
            all = all + data.toString();
            log.debug(data.toString());
            if (data.toString().indexOf('tags') === -1) {
                return resolve(all);
            }
        });
        readableStream.once('error', reject);
    });
}

module.exports = {
    run(videoPath) {
        const scriptArgs = [
            '-f', 'lavfi',
            '-i', 'movie=' + videoPath + ',signalstats',
            '-show_entries', 'frame_tags=lavfi.signalstats.SATAVG',
            //  '-of', 'flat',
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
