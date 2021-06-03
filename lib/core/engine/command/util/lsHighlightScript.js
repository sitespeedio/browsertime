'use strict';
module.exports = `
(function(options) {
    const rectColor = options.color;
    const limit = options.limit;
    const observer = new PerformanceObserver(list => {});
    observer.observe({ type: 'layout-shift', buffered: true });
    const entries = observer.takeRecords();
    if (entries.length > 0) {
        const canvas = document.createElement('canvas'); 
        canvas.style.width='100%';
        canvas.style.height='100%';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position='absolute';
        canvas.style.left=0;
        canvas.style.top=0;
        canvas.style.zIndex=2147483646;
        canvas.id = "browsertime-ls";
        document.body.appendChild(canvas);

        function paintRectangle(context, clientRect, color) { 
            context.fillStyle = color;
            context.globalAlpha = 0.03;
            context.rect(Math.max(0,clientRect.x), Math.max(0,clientRect.y), Math.min(clientRect.width, window.innerWidth - clientRect.x) , Math.min(clientRect.height, window.innerHeight-clientRect.y));
            context.fill();


            context.strokeStyle = color;
            context.globalAlpha = 1.0;
            context.rect(Math.max(0,clientRect.x), Math.max(0,clientRect.y), Math.min(clientRect.width, window.innerWidth - clientRect.x) , Math.min(clientRect.height, window.innerHeight-clientRect.y));
            context.stroke();
        }

        let maxSessionGap1sLimit5s = {}; 
        let max = 0; 
        let current = [];
        let curr = 0; 
        let firstTs = Number.NEGATIVE_INFINITY;
        let prevTs = Number.NEGATIVE_INFINITY;

        for (let entry of entries) {
            if (entry.hadRecentInput || entry.value <= limit) {
                continue;
            } 
        if (entry.startTime - firstTs > 5000 || entry.startTime - prevTs > 1000) {
            firstTs = entry.startTime;
            curr = 0;
            maxSessionGap1sLimit5s[max] = [...current];
            current = []; 
          }
          prevTs = entry.startTime;
          curr += entry.value;
          max = Math.max(max, curr);
          current.push(entry);
        }

          for (let entry of maxSessionGap1sLimit5s[max] || current) {
            for (let source of entry.sources) {
                if (source.previousRect && source.currentRect) {
                    const context = canvas.getContext('2d');
                    
                    // paintRectangle(context, source.previousRect, "yellow", false);
                    paintRectangle(context, source.currentRect, rectColor);
                
                    context.font = "bolder 24px Arial";
                    context.fillStyle = "black";
                    context.fillText(entry.value.toFixed(4), Math.max(0,source.currentRect.x) + 24,Math.max(0,source.currentRect.y) + 24);

                }
            }
        }
    }
})(arguments[arguments.length - 1]);
`;
