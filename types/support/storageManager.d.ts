export class StorageManager {
    constructor(url: any, { resultDir, prettyPrint }?: {
        prettyPrint?: boolean;
    });
    baseDir: string;
    jsonIndentation: number;
    createDataDir(): Promise<string>;
    createSubDataDir(...name: any[]): Promise<string>;
    rm(filename: any): Promise<void>;
    writeData(filename: any, data: any, subdir: any): Promise<string>;
    writeJson(filename: any, json: any, shouldGzip: any): Promise<string>;
    readData(filename: any, subdir: any): Promise<string | Buffer>;
    gzip(inputFile: any, outputFile: any, removeInput: any): Promise<any>;
    get directory(): string;
}
//# sourceMappingURL=storageManager.d.ts.map