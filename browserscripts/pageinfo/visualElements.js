(function (custom) {
    /**
     * Collect visual elements from a page and feed the size back in the 
     * format for Visual Metrics.
     */

    const elementByType = {};
    const areaByType = {};
    const imageTags = [].slice.call(document.body.getElementsByTagName('img'));
    const h1Tags = [].slice.call(document.body.getElementsByTagName('h1'));

    // When we feed options from the CLI it can be a String or an 
    // Array with Strings. Make it easy to treat everything the same. 
    function toArray(arrayLike) {
        if (arrayLike === undefined || arrayLike === null) {
            return [];
        }
        if (Array.isArray(arrayLike)) {
            return arrayLike;
        }
        return [arrayLike];
    }

    function isLargest(type, area) {
        if (!areaByType[type]) {
            return true;
        } else return areaByType[type] < area;
    }

    // Inspired by
    // https://gomakethings.com/how-to-test-if-an-element-is-in-the-viewport-with-vanilla-javascript/
    // Only include elements that are fully within the viewport
    function visibleInViewport(elem) {
        const bounding = elem.getBoundingClientRect();
        return (
            bounding.height > 0 && // is visible
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.bottom <= document.documentElement.clientHeight &&
            bounding.right <= document.documentElement.clientWidth
        );
    };

    function test(type, element) {
        const rect = element.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (isLargest(type, area)) {
            const filename = element.src ? element.src.substring(element.src.lastIndexOf('/') + 1) : undefined;

            elementByType[type] = {
                name: type,
                x: Math.round(rect.left),
                y: Math.round(rect.top),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                filename
            };
            areaByType[type] = area;
        }
    }

    if (custom) {
        // Input could be a String or an Array of Strings so convert it
        const customArray = toArray(custom);
        for (const nameAndSelector of customArray) {
            const parts = nameAndSelector.split(':');
            const type = parts[0];
            const selector = parts[1];
            const element = document.body.querySelector(selector);
            try {
                 if (visibleInViewport(element)) {
                     test(type, element);
                 }
            } catch (e) {
                throw new Error('Could not find matching element for selector:' + selector + ' using document.body.querySelector. Do that element exist on the page?');
            }
        }
    }

    let type = 'LargestImage';
    imageTags.forEach(function (element) {    
        if (visibleInViewport(element)) {
            test(type, element);
        }
    });

    type = 'Heading';
    h1Tags.forEach(function (element) {
        if (visibleInViewport(element)) {
            test(type, element);
        }
    });

    // We need to follow the standard for VisualMetrics
    return {
        viewport: {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        },
        // "heroes" :D https://github.com/sitespeedio/logo/blob/master/png/heroes/Pippi-Sitespeed.io.png
        heroes: Object.keys(elementByType).map(function (type) {
            return elementByType[type];
        })
    };
})(arguments[arguments.length - 1]);