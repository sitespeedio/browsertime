/**
 * Filters to use with Array.prototype.filter, e.g. ['/a/path', '/another/path'].filter(onlyFiles)
 */
export function onlyWithExtension(extension: any): (filepath: any) => boolean;
export function onlyFiles(filepath: any): Promise<boolean>;
export function onlyDirectories(filepath: any): Promise<boolean>;
//# sourceMappingURL=filters.d.ts.map