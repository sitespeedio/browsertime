'use strict';
module.exports = `
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
    for (let entry of entries) {
        if (entry.hadRecentInput) {
            continue;
          } 
        for (let source of entry.sources) {
            if (source.node && source.node.getBoundingClientRect) {
                const clientRect = source.node.getBoundingClientRect();
                const context = canvas.getContext('2d');
                context.fillStyle = "yellow";
                context.strokeStyle = "yellow";
                context.globalAlpha = 0.03;
                context.rect(Math.max(0,clientRect.x), Math.max(0,clientRect.y), Math.min(clientRect.width, window.innerWidth - clientRect.x) , Math.min(clientRect.height, window.innerHeight-clientRect.y));
                context.fill();

                context.globalAlpha = 1.0;
                context.rect(Math.max(0,clientRect.x), Math.max(0,clientRect.y), Math.min(clientRect.width, window.innerWidth - clientRect.x) , Math.min(clientRect.height, window.innerHeight-clientRect.y));
                context.stroke();
                
                context.font = "bolder 24px Arial";
                context.fillStyle = "black";
                context.fillText(entry.value.toFixed(4), Math.max(0,clientRect.x) + 24,Math.max(0,clientRect.y) + 24);

            }
        }
    }
}
`;
