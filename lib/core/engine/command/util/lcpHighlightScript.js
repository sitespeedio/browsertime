'use strict';
module.exports = `
return (function(color) {
    const observer = new PerformanceObserver(list => {});
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    const entries = observer.takeRecords();
    if (entries.length > 0) {
        const largestEntry = entries[entries.length - 1];
        // There could be cases where we do not get an element
        if (largestEntry.element) {
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
            context.strokeStyle = color;
            context.stroke();

            context.fillStyle = color;
            context.globalAlpha = 0.1;
            context.rect(Math.max(0,clientRect.x), Math.max(0,clientRect.y), Math.min(clientRect.width, window.innerWidth - clientRect.x) , Math.min(clientRect.height, window.innerHeight-clientRect.y));
            context.fill();
            return '';
        } else {
            return 'No element attached to the entry in largest-contentful-paint';
        }
    }
})(arguments[arguments.length - 1]);
`;
