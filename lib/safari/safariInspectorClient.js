/* global WebSocket */
import { execa } from 'execa';
import { getLogger } from '@sitespeed.io/log';

const log = getLogger('browsertime.safari.inspector');

export class SafariInspectorClient {
  constructor(options) {
    this.options = options;
    this.safariOptions = options.safari || {};
    this.port = options.iwdpPort || 9222;
    this.connections = [];
    this.targetId = undefined;
    this.targetWs = undefined; // The WebSocket that owns the active target
    this.pinnedWs = undefined; // When set, only this ws may set targetId
    this.messageId = 0;
    this.pendingMessages = new Map();
    this.eventListeners = new Map();
    this.iwdpProcess = undefined;
  }

  async setup(targetMatcher) {
    await this._verifyIwdpInstalled();
    await this._startIwdp();
    await this._waitForIwdp();
    await this._connectWebSockets(targetMatcher);
    await this._waitForTarget();
  }

  async _verifyIwdpInstalled() {
    try {
      await execa('which', ['ios_webkit_debug_proxy']);
    } catch {
      throw new Error(
        'ios_webkit_debug_proxy is not installed. Install it with: brew install ios-webkit-debug-proxy'
      );
    }
  }

  async _startIwdp() {
    const args = ['-F'];
    if (this.safariOptions.deviceUDID) {
      args.push('-u', this.safariOptions.deviceUDID);
    }
    log.debug('Starting ios_webkit_debug_proxy on port %d', this.port);
    this.iwdpProcess = execa('ios_webkit_debug_proxy', args, {
      stdio: 'ignore'
    });
    this.iwdpProcess.catch(error => {
      if (!error.isCanceled) {
        log.error('ios_webkit_debug_proxy failed: %s', error.message);
      }
    });
  }

  async _waitForIwdp() {
    const maxRetries = 20;
    const retryDelay = 500;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`http://localhost:${this.port}/json`);
        if (response.ok) {
          log.debug('ios_webkit_debug_proxy is ready');
          return;
        }
      } catch {
        // Not ready yet
      }
      await new Promise(r => setTimeout(r, retryDelay));
    }
    throw new Error(
      `ios_webkit_debug_proxy did not start within ${(maxRetries * retryDelay) / 1000} seconds`
    );
  }

  async _connectWebSockets(targetMatcher) {
    const response = await fetch(`http://localhost:${this.port}/json`);
    const pages = await response.json();

    for (const page of pages) {
      if (!page.webSocketDebuggerUrl) continue;
      try {
        const ws = await new Promise((resolve, reject) => {
          const socket = new WebSocket(page.webSocketDebuggerUrl);
          socket.addEventListener('open', () => resolve(socket));
          socket.addEventListener('error', () =>
            reject(new Error('WebSocket error'))
          );
          setTimeout(() => reject(new Error('timeout')), 5000);
        });

        // Pin BEFORE the message listener is attached so the very first
        // Target.targetCreated from any other tab cannot set targetId.
        if (targetMatcher && targetMatcher(page)) {
          this.pinnedWs = ws;
        }

        ws.addEventListener('message', event => {
          this._handleMessage(ws, JSON.parse(event.data));
        });

        this.connections.push({ ws, page });
        log.debug('Connected to page: %s', page.title || page.url || 'unknown');
      } catch {
        // Skip pages we can't connect to
      }
    }

    if (this.connections.length === 0) {
      throw new Error(
        'No inspectable Safari pages found via ios_webkit_debug_proxy'
      );
    }

    if (targetMatcher && !this.pinnedWs) {
      log.warn(
        'Could not identify the WebDriver Safari tab via iWDP — HAR may be empty if other tabs are open on the device'
      );
    }
    log.debug('Connected to %d inspectable pages', this.connections.length);
  }

  async _waitForTarget() {
    // Wait for targetCreated events
    await new Promise(r => setTimeout(r, 1500));

    if (this.targetId) {
      log.debug('Network and Page enabled on target %s', this.targetId);
    } else {
      log.debug(
        'No page target found yet — will enable Network when a target appears'
      );
    }
  }

  _handleMessage(ws, msg) {
    // Handle Target.targetCreated — auto-enable Network on new page targets
    if (msg.method === 'Target.targetCreated') {
      const target = msg.params?.targetInfo;
      if (target?.type === 'page') {
        // If we've pinned the WebDriver-controlled tab, ignore targetCreated
        // from unrelated tabs so they can't clobber the active target.
        if (this.pinnedWs && ws !== this.pinnedWs) return;
        this.targetId = target.targetId;
        this.targetWs = ws; // Remember which WebSocket owns this target
        log.debug('Found page target: %s', this.targetId);
        // Enable Network and Page on this target immediately
        this._sendOnWs(ws, 'Target.sendMessageToTarget', {
          targetId: target.targetId,
          message: JSON.stringify({
            id: ++this.messageId,
            method: 'Network.enable',
            params: {}
          })
        });
        this._sendOnWs(ws, 'Target.sendMessageToTarget', {
          targetId: target.targetId,
          message: JSON.stringify({
            id: ++this.messageId,
            method: 'Page.enable',
            params: {}
          })
        });
      }
    }

    // Unwrap Target.dispatchMessageFromTarget — only from the active target
    if (msg.method === 'Target.dispatchMessageFromTarget') {
      try {
        const innerMsg = JSON.parse(msg.params.message);
        // Only dispatch events from the active target to avoid cross-tab noise
        const fromTargetId = msg.params.targetId;
        if (innerMsg.method && fromTargetId === this.targetId) {
          const listeners = this.eventListeners.get(innerMsg.method) || [];
          for (const cb of listeners) {
            cb(innerMsg.params);
          }
        }
        // Resolve pending commands
        if (
          innerMsg.id !== undefined &&
          this.pendingMessages.has(innerMsg.id)
        ) {
          const { resolve } = this.pendingMessages.get(innerMsg.id);
          this.pendingMessages.delete(innerMsg.id);
          resolve(innerMsg);
        }
      } catch {
        // Not valid JSON
      }
    }

    // Resolve top-level responses
    if (msg.id !== undefined && this.pendingMessages.has(msg.id)) {
      const { resolve } = this.pendingMessages.get(msg.id);
      this.pendingMessages.delete(msg.id);
      resolve(msg);
    }
  }

  /**
   * Send a command to the active page target via Target.sendMessageToTarget.
   */
  async send(method, params = {}) {
    if (!this.targetId || !this.targetWs) {
      throw new Error('No target available for sending commands');
    }
    const innerId = ++this.messageId;
    const innerMsg = JSON.stringify({ id: innerId, method, params });

    return new Promise((resolve, reject) => {
      this.pendingMessages.set(innerId, { resolve, reject });
      try {
        const outerId = ++this.messageId;
        this.targetWs.send(
          JSON.stringify({
            id: outerId,
            method: 'Target.sendMessageToTarget',
            params: { targetId: this.targetId, message: innerMsg }
          })
        );
      } catch (error) {
        this.pendingMessages.delete(innerId);
        reject(error);
      }
      setTimeout(() => {
        if (this.pendingMessages.has(innerId)) {
          this.pendingMessages.delete(innerId);
          resolve({ error: 'timeout' });
        }
      }, 10_000);
    });
  }

  /**
   * Fire-and-forget send on a specific WebSocket.
   */
  _sendOnWs(ws, method, params) {
    try {
      ws.send(JSON.stringify({ id: ++this.messageId, method, params }));
    } catch (error) {
      log.debug('Send error: %s', error.message);
    }
  }

  on(eventName, callback) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(callback);
  }

  removeAllListeners() {
    this.eventListeners.clear();
  }

  /**
   * Reconnect to iwdp to discover new pages that appeared after initial setup.
   * This is needed because safaridriver may create new tabs that weren't
   * in the original page list.
   */
  async reconnect() {
    const response = await fetch(`http://localhost:${this.port}/json`);
    const pages = await response.json();

    // Find pages we're not already connected to
    const connectedUrls = new Set(
      this.connections.map(c => c.page.webSocketDebuggerUrl)
    );

    for (const page of pages) {
      if (!page.webSocketDebuggerUrl) continue;
      if (connectedUrls.has(page.webSocketDebuggerUrl)) continue;

      try {
        const ws = await new Promise((resolve, reject) => {
          const socket = new WebSocket(page.webSocketDebuggerUrl);
          socket.addEventListener('open', () => resolve(socket));
          socket.addEventListener('error', () =>
            reject(new Error('WebSocket error'))
          );
          setTimeout(() => reject(new Error('timeout')), 3000);
        });

        ws.addEventListener('message', event => {
          this._handleMessage(ws, JSON.parse(event.data));
        });

        this.connections.push({ ws, page });
        log.debug(
          'Reconnected to new page: %s (%s)',
          page.title || 'untitled',
          page.url || 'no url'
        );
      } catch {
        // Skip
      }
    }
  }

  async close() {
    for (const conn of this.connections) {
      try {
        conn.ws.close();
      } catch {
        // Ignore close errors
      }
    }
    this.connections = [];
    this.targetWs = undefined;
    this.pinnedWs = undefined;
    if (this.iwdpProcess) {
      try {
        this.iwdpProcess.kill();
      } catch {
        // Ignore kill errors
      }
      this.iwdpProcess = undefined;
    }
    log.debug('Safari inspector client closed');
  }
}
