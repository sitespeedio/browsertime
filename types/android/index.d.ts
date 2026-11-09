/**
 * Firefox cannot write to the Browsertime folder on the computer, so on
 * Android files like the MOZ log go to the app folder on the sdcard, where adb
 * can read them.
 */
export function getFirefoxAppDir(firefoxConfig: any): string;
export function getAndroidBrowserPackage(options: any): any;
export function isAndroidConfigured(options: any): boolean;
export class Android {
    constructor(options: any);
    id: any;
    port: any;
    screenBrightnessMode: number;
    screenBrightness: number;
    tmpDir: string;
    _init(): Promise<void>;
    sdcard: any;
    _adb(arguments_: any, options: any): any;
    _runCommand(command: any): Promise<any>;
    /**
     * The window that has the focus, like
     * com.android.chrome/org.chromium.chrome.browser.ChromeTabbedActivity
     */
    getFocusedWindow(): Promise<any>;
    _runCommandAndGet(command: any): Promise<any>;
    _runAsRootAndGet(command: any): Promise<any>;
    _runAsRoot(command: any): Promise<boolean>;
    _downloadFile(sourcePath: any, destinationPath: any): Promise<void>;
    _uploadFile(sourcePath: any, destinationPath: any): Promise<void>;
    _downloadDir(sourcePath: any, destinationPath: any): Promise<void>;
    _listDir(dir: any): Promise<any>;
    getFullPathOnSdCard(path: any): string;
    mkDirOnSdCard(dirName: any): Promise<any>;
    removeFileOnSdCard(file: any): Promise<any>;
    removePathOnSdCard(path: any): Promise<any>;
    reboot(): Promise<any>;
    getTemperature(): Promise<number>;
    getMeta(): Promise<{
        model: any;
        name: any;
        device: any;
        androidVersion: any;
        id: any;
        wifi: any;
    }>;
    pullWindowRecordings(sourceDir: any, destinationDir: any): Promise<void>;
    writeCommandLineFile(fileName: any, content: any): Promise<void>;
    pullMozLogs(sourceDir: any, destinationDir: any, index: any): Promise<void>;
    pullNetLog(destination: any): Promise<void>;
    addDevtoolsFw(socket?: string): Promise<any>;
    devtoolsSocket: string;
    removeDevtoolsFw(): Promise<any>;
    startVideo(): Promise<void>;
    ping(address: any): Promise<boolean>;
    clickPowerButton(): Promise<any>;
    getWifi(): Promise<any>;
    closeAppNotRespondingPopup(): Promise<any>;
    pressHomeButton(): Promise<any>;
    stopVideo(): Promise<any>;
    getPhoneState(): Promise<any>;
    pullVideo(destinationPath: any): Promise<void>;
    removeVideo(): Promise<any>;
    pidof(packageName: any): Promise<any>;
    _pidofWithPidof(packageName: any): Promise<number>;
    _pidofWithPs(packageName: any): Promise<number>;
    _processStartTime(pid: any): Promise<{
        dateInMs: number;
        systemUptimeInSeconds: any;
        utilStartTimeAfterSystemStartTimeInJiffies: any;
        processStartTimeAfterSystemStartTimeInJiffies: any;
        jiffesPerSeconds: number;
        processStartTimeInMs: number;
    }>;
    processStartTime(pid: any, count?: number): Promise<number>;
    startPowerTesting(): Promise<void>;
    stopPowerTesting(): Promise<void>;
    resetPowerUsage(): Promise<void>;
    measurePowerUsage(packageName: any): Promise<{
        'full-screen': number;
        'full-wifi': number;
        total: number;
    }>;
    measureUsbPowerUsage(startTime: any, endTime: any): Promise<{
        powerUsage: any;
        baselineUsage: number;
    }>;
    getUsbPowerUsageProfile(index: any, url: any, result: any, options: any, storageManager: any): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map