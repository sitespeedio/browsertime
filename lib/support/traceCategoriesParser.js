'use strict';

module.exports = {
    parse(events) {
      const cleaned = [];
      let hasStarted = false;
          for (let event of events) {
            // wait to the first TracingStartedInPage event and push everything after that
            // this avoids getting multiple DomContentLoaded events
            // We also get two TracingStartedInBrowser events?
            if (event.params.name === 'TracingStartedInPage'){
              hasStarted = true;
            }
            if (event.method === 'Tracing.dataCollected' && hasStarted) {
                cleaned.push(event.params);
            }
        }
        return {traceEvents: cleaned};
    }
}
