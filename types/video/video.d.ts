/**
 * Create a new Video that handles everything with the video
 * @class
 */
export class Video {
    constructor(storageManager: any, options: any, browser: any);
    options: any;
    storageManager: any;
    tmpDir: any;
    recorder: import("./screenRecording/android/recorder.js").AndroidRecorder | import("./screenRecording/desktop/desktopRecorder.js").DesktopRecorder | import("./screenRecording/firefox/firefoxWindowRecorder.js").FirefoxWindowRecorder | import("./screenRecording/iosSimulator/recorder.js").IOSSimulatorRecorder | import("./screenRecording/ios/iosRecorder.js").IOSRecorder;
    isRecording: boolean;
    setupDirs(index: any, url: any): Promise<void>;
    index: any;
    videoDir: any;
    filmstripDir: any;
    /**
     * Start recoding a video.
     * @returns {Promise} Promise object that represents when the video started
     */
    record(pageNumber: any, index: any, visitedPageNumber: any): Promise<any>;
    pageNumber: any;
    visitedPageNumber: any;
    /**
     * Stop recording the video.
     * @returns {Promise} Promise object that represents when the video stopped
     */
    stop(url: any): Promise<any>;
    videoPath: string;
    cleanup(): Promise<void>;
    /**
      Post process video: get visual metrics, finetune the video and remove it
      if you don't want it
     */
    postProcessing(timingMetrics: any, visualElements: any): Promise<{
        videoRecordingStart: any;
        visualMetrics: any;
    }>;
    getRecordingStartTime(): any;
    getTimeToFirstFrame(): any;
}
//# sourceMappingURL=video.d.ts.map