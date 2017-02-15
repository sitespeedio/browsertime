'use strict';

module.exports = {
    parse(events) {
        const cleaned = [];
        for (let event of events) {
            if (event.method === 'Tracing.dataCollected') {
                cleaned.push(event.params);
            }
        }
        return cleaned;
    }
}
