'use strict';
module.exports = `
const observer = new PerformanceObserver(list => {});
observer.observe({ type: 'layout-shift', buffered: true });
const entries = observer.takeRecords();
console.log(entries.length);
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

    function paintRectangle(context, clientRect, color, fill) {
        
        if (fill) {
            context.fillStyle = color;
            context.globalAlpha = 0.03;
            context.rect(Math.max(0,clientRect.x), Math.max(0,clientRect.y), Math.min(clientRect.width, window.innerWidth - clientRect.x) , Math.min(clientRect.height, window.innerHeight-clientRect.y));
            context.fill();
        }

        context.strokeStyle = color;
        context.globalAlpha = 1.0;
        context.rect(Math.max(0,clientRect.x), Math.max(0,clientRect.y), Math.min(clientRect.width, window.innerWidth - clientRect.x) , Math.min(clientRect.height, window.innerHeight-clientRect.y));
        context.stroke();
    }

    for (let entry of entries) {
        if (entry.hadRecentInput) {
            continue;
        } 
        for (let source of entry.sources) {
            if (source.previousRect && source.currentRect) {
                const context = canvas.getContext('2d');
                
                // paintRectangle(context, source.previousRect, "yellow", false);
                paintRectangle(context, source.currentRect, "red", true);
              
                context.font = "bolder 24px Arial";
                context.fillStyle = "black";
                context.fillText(entry.value.toFixed(4), Math.max(0,source.currentRect.x) + 24,Math.max(0,source.currentRect.y) + 24);

            }
        }
    }
}
`;
