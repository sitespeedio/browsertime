/* Copyright 2023 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { exportAsHAR } from './har.js';

export class HarBuilder {
  constructor(driver, browsingContextIds) {
    this._driver = driver;
    this._browsingContextIds = browsingContextIds;
    this._onMessage = this._onMessage.bind(this);

    this.networkEntries = [];
    this.pageTimings = [];

    this.listener = {};
  }

  /**
   * Subscribe to log event
   * @returns {Promise<void>}
   */
  async startRecording() {
    this.bidi = await this._driver.getBidi();

    await this.bidi.subscribe(
      'browsingContext.domContentLoaded',
      this._browsingContextIds
    );
    await this.bidi.subscribe('browsingContext.load', this._browsingContextIds);
    await this.bidi.subscribe(
      'network.beforeRequestSent',
      this._browsingContextIds
    );
    await this.bidi.subscribe(
      'network.responseCompleted',
      this._browsingContextIds
    );

    this.ws = await this.bidi.socket;
    this.ws.on('message', this._onMessage);
  }

  /**
   * Unsubscribe to log event
   * @returns {Promise<void>}
   */
  async stopRecording() {
    await this.bidi.unsubscribe(
      'browsingContext.domContentLoaded',
      this._browsingContextIds
    );
    await this.bidi.unsubscribe(
      'browsingContext.load',
      this._browsingContextIds
    );
    await this.bidi.unsubscribe(
      'network.beforeRequestSent',
      this._browsingContextIds
    );
    await this.bidi.unsubscribe(
      'network.responseCompleted',
      this._browsingContextIds
    );

    const harExport = exportAsHAR(this.networkEntries, this.pageTimings);

    this.networkEntries = [];
    this.pageTimings = [];

    return harExport;
  }

  _onBeforeRequestSent(params) {
    this.networkEntries.push({
      contextId: params.context,
      id: params.request.request + params.request.redirectCount,
      url: params.request.url,
      request: params.request
    });
  }

  _onBrowsingContextEvent(type, params) {
    const { context, timestamp, url } = params;
    const firstRequest = this.networkEntries.findLast(
      entry => entry.contextId === context && entry.request.url === url
    );
    
    if (!firstRequest) {
      // Bail out if no request matches this event.
      return;
    }

    let relativeTime = +Number.POSITIVE_INFINITY,
      startedTime = -1;
    
    const timings = firstRequest.request.timings;
    startedTime = timings.requestTime / 1000;
    relativeTime = timestamp - startedTime;
    relativeTime = relativeTime.toFixed(1);
    firstRequest.isFirstRequest = true;

    this.pageTimings.push({
      contextId: context,
      relativeTime,
      startedTime,
      timestamp,
      type,
      url
    });
  }

  _onMessage(event) {
    const { method, params } = JSON.parse(Buffer.from(event.toString()));
    switch (method) {
      case 'network.beforeRequestSent': {
        this._onBeforeRequestSent(params);
        break;
      }
      case 'network.responseCompleted': {
        this._onResponseCompleted(params);
        break;
      }
      case 'browsingContext.domContentLoaded': {
        this._onBrowsingContextEvent('domContentLoaded', params);
        break;
      }
      case 'browsingContext.load': {
        this._onBrowsingContextEvent('load', params);
        break;
      }
    }
  }

  _onResponseCompleted(params) {
    const entry = this.networkEntries.find(
      e =>
        e.request.request === params.request.request &&
        e.request.redirectCount === params.request.redirectCount
    );
    entry.request = params.request;
    entry.response = params.response;
  }
}
