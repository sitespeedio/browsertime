'use strict';

module.exports = {
    parse(events) {
        // TODO we should set a real timestamp when we start
        // Inspired by https://github.com/Blazemeter/taurus/blob/master/examples/selenium/chrome-performance/chrome_performance.py
        const cleaned = [{"name": "start_time", "args": {"timestamp": 0}, "ts": 0, "cat": "__metadata", "ph": "M"}];
        for (let event of events) {
            if (event.method === 'Tracing.dataCollected') {
                cleaned.push(event.params);
            }
        }
        return cleaned;
    }
}
