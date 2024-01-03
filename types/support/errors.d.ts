export class BrowsertimeError extends Error {
    constructor(message: any, extra: any);
    extra: any;
}
export class BrowserError extends BrowsertimeError {
}
export class UrlLoadError extends BrowsertimeError {
    constructor(message: any, url: any, extra: any);
    url: any;
}
export class TimeoutError extends BrowsertimeError {
    constructor(message: any, url: any, extra: any);
    url: any;
}
//# sourceMappingURL=errors.d.ts.map