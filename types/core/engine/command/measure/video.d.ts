/**
 * Handles video recording during measurement.
 * @class
 * @private
 */
export class MeasureVideo {
    constructor(storageManager: any, browser: any, videos: any, options: any);
    storageManager: any;
    browser: any;
    videos: any;
    options: any;
    recordVideo: any;
    ANDROID_DELAY_TIME: any;
    IOS_DELAY_TIME: any;
    DESKTOP_DELAY_TIME: any;
    start(numberOfMeasuredPages: any, index: any): Promise<any>;
    video: Video;
    stop(url: any): Promise<void>;
    getRecordingMetadata(): {
        recordingStartTime: number;
        timeToFirstFrame: number;
    };
    shouldRecord(): boolean;
}
import { Video } from '../../../../video/video.js';
//# sourceMappingURL=video.d.ts.map