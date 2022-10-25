export class BrowsertimeError extends Error {
  constructor(message, extra) {
    super(message);
    this.extra = extra || {};
    this.name = this.constructor.name;
  }
}

export class BrowserError extends BrowsertimeError {
  constructor(message, extra) {
    super(message, extra);
  }
}

export class UrlLoadError extends BrowsertimeError {
  constructor(message, url, extra) {
    super(message, extra);
    this.url = url;
  }
}

export class TimeoutError extends BrowsertimeError {
  constructor(message, url, extra) {
    super(message, extra);
    this.url = url;
  }
}
