export class FirefoxWindowRecorder {
    constructor(options: any, browser: any, baseDir: any);
    options: any;
    browser: any;
    baseDir: any;
    recordingStartTime: any;
    timeToFirstFrame: number;
    start(): Promise<any>;
    android: Android;
    stop(destination: any): Promise<void>;
}
import { Android } from '../../../android/index.js';
//# sourceMappingURL=firefoxWindowRecorder.d.ts.map