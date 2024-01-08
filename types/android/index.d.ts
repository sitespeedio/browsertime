export function isAndroidConfigured(options: any): boolean;
export class Android {
    constructor(options: any);
    client: any;
    id: any;
    port: any;
    screenBrightnessMode: number;
    screenBrightness: number;
    tmpDir: string;
    _init(): Promise<void>;
    device: any;
    sdcard: any;
    _runCommand(command: any): Promise<any>;
    _runCommandAndGet(command: any): Promise<any>;
    _runAsRootAndGet(command: any): Promise<any>;
    _runAsRoot(command: any): Promise<boolean>;
    _downloadFile(sourcePath: any, destinationPath: any): Promise<any>;
    _downloadDir(sourcePath: any, destinationPath: any): Promise<void>;
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
    pullNetLog(destination: any): Promise<any>;
    addDevtoolsFw(): Promise<any>;
    removeDevtoolsFw(): Promise<({
        all?: string;
        isCanceled: boolean;
    } & import("execa").ExecaReturnBase<string>)[]>;
    startVideo(): Promise<any>;
    ping(address: any): Promise<boolean>;
    clickPowerButton(): Promise<any>;
    getWifi(): Promise<any>;
    closeAppNotRespondingPopup(): Promise<any>;
    pressHomeButton(): Promise<any>;
    stopVideo(): Promise<any>;
    getPhoneState(): Promise<string>;
    pullVideo(destinationPath: any): Promise<any>;
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
}
//# sourceMappingURL=index.d.ts.map