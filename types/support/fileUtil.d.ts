export function rename(old: any, newName: any): Promise<void>;
export function copyFileSync(source: any, destination: any): void;
export function removeFileSync(fileName: any): Promise<void>;
export function copyFile(source: any, destination: any): Promise<void>;
export function removeFile(fileName: any): Promise<void>;
export function readFile(fileName: any): Promise<Buffer>;
export function removeDirAndFiles(dirName: any): Promise<void>;
export function removeByType(dir: any, type: any): Promise<void>;
export function findFiles(dir: any, filter: any): Promise<string[]>;
export function findUpSync(filenames: any, startDir?: string): string;
//# sourceMappingURL=fileUtil.d.ts.map