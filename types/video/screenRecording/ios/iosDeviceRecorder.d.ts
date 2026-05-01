/**
 * Records the screen of an iOS device connected via USB.
 *
 * Uses the ios-capture server process that was started by the
 * Safari delegate in beforeBrowserStart(). The server accepts
 * START/STOP commands via stdin to control recording per iteration.
 */
export class IOSDeviceRecorder {
    constructor(options: any, baseDir: any);
    options: any;
    baseDir: any;
    responseBuffer: string;
    /**
     * Start recording to a temporary file.
     */
    start(): Promise<void>;
    _listeningForResponses: boolean;
    tmpVideo: string;
    /**
     * Stop the current recording and move the video to the destination.
     */
    stop(destination: any): Promise<void>;
    /**
     * Wait for a specific response from ios-capture stdout.
     */
    _waitForResponse(expected: any, timeoutMs: any): Promise<boolean>;
}
//# sourceMappingURL=iosDeviceRecorder.d.ts.map