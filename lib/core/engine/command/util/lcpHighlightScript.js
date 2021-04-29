'use strict';
module.exports = `
const observer = new PerformanceObserver(list => {});
observer.observe({ type: 'largest-contentful-paint', buffered: true });
const entries = observer.takeRecords();
if (entries.length > 0) {
    const largestEntry = entries[entries.length - 1];
    const clientRect = largestEntry.element.getBoundingClientRect();

    const canvas = document.createElement('canvas'); //Create a canvas element
    canvas.style.width='100%';
    canvas.style.height='100%';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position='absolute';
    canvas.style.left=0;
    canvas.style.top=0;
    canvas.style.zIndex=2147483646;
    canvas.id = "browsertime-lcp";
    document.body.appendChild(canvas); 
    const context = canvas.getContext('2d');
    context.rect(Math.max(0,clientRect.x), Math.max(0,clientRect.y), Math.min(clientRect.width, window.innerWidth - clientRect.x) , Math.min(clientRect.height, window.innerHeight-clientRect.y));
    context.lineWidth = "6";
    context.strokeStyle = "red";
    context.stroke();
}
`;
