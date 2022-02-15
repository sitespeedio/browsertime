const test = require('ava');
const builder = require('../../lib/support/har');

let har;

const totalResultsBase = [
  {
    googleWebVitals: {},
    visualMetrics: [
      {
        SpeedIndex: 100,
        PerceptualSpeedIndex: 200,
        ContentfulSpeedIndex: 300,
        VisualProgress: [
          { timestamp: 0, percent: 0 },
          { timestamp: 10, percent: 50 },
          { timestamp: 20, percent: 100 }
        ]
      }
    ],
    info: {
      url: 'https://example.com'
    },
    cpu: [
      {
        longTasks: {
          tasks: 1,
          totalBlockingTime: 10
        }
      }
    ],
    browserScripts: [
      {
        timings: {
          firstPaint: 100,
          largestContentfulPaint: {
            renderTime: 200
          }
        }
      }
    ]
  }
];

test.serial.beforeEach('Setup the HAR', () => {
  har = {
    log: {
      version: '1.2',
      browser: {
        name: 'Chrome',
        version: '42.0.2311.90',
        comment: ''
      },
      pages: [
        {
          id: 'page_0'
        }
      ],
      entries: [
        {
          pageref: 'page_0'
        }
      ]
    }
  };
});

test('Add creator if missing', t => {
  builder.addCreator(har, 'foo');
  t.is(har.log.creator.name, 'Browsertime');
  t.is(har.log.creator.comment, 'foo');
});

test('Not add comment to creator unless specified', t => {
  builder.addCreator(har);
  t.is(har.log.creator.name, 'Browsertime');
  t.is(har.log.creator.comment, undefined);
});

test('Merge two hars', t => {
  builder.addCreator(har);

  let har2 = {
    log: {
      version: 'kjsdhfksa',
      browser: {
        name: 'jksdhfjksd',
        version: 'jkdhfkjsdfdkjsf',
        comment: ''
      },
      pages: [
        {
          id: 'page_0'
        },
        {
          id: 'page_1'
        }
      ],
      entries: [
        {
          pageref: 'page_0'
        },
        {
          pageref: 'page_1'
        }
      ]
    }
  };

  let combinedHar = builder.mergeHars([har, har2]);

  t.deepEqual(combinedHar.log.pages, [
    {
      id: 'page_0'
    },
    {
      id: 'page_0-1'
    },
    {
      id: 'page_1'
    }
  ]);

  t.deepEqual(combinedHar.log.entries, [
    {
      pageref: 'page_0'
    },
    {
      pageref: 'page_0-1'
    },
    {
      pageref: 'page_1'
    }
  ]);

  t.is(combinedHar.log.version, '1.2');
  t.is(combinedHar.log.creator.name, 'Browsertime');
});

test('Gracefully handle missing data', t => {
  builder.addExtraFieldsToHar();
  t.pass();
});

test('Add visual metrics if given', t => {
  const options = {
    iterations: 1
  };
  const totalResults = totalResultsBase;
  har.log.pages[0].pageTimings = {};
  builder.addExtraFieldsToHar(totalResults, har, options);
  t.deepEqual(har.log.pages[0], {
    id: 'page_0',
    _meta: {
      connectivity: 'native'
    },
    _visualMetrics: {
      SpeedIndex: 100,
      PerceptualSpeedIndex: 200,
      ContentfulSpeedIndex: 300,
      VisualProgress: {
        0: 0,
        10: 50,
        20: 100
      }
    },
    pageTimings: {
      _largestContentfulPaint: 200
    },
    _cpu: {
      longTasks: {
        tasks: 1,
        totalBlockingTime: 10
      }
    }
  });
});

test('Gracefully handle missing cpu and visual metrics', t => {
  const totalResults = totalResultsBase;
  const options = {
    iterations: 1
  };
  har.log.pages[0].pageTimings = {};

  totalResults[0].visualMetrics = [];
  totalResults[0].cpu = [{}];
  builder.addExtraFieldsToHar(totalResults, har, options);
  t.deepEqual(har.log.pages[0], {
    id: 'page_0',
    _meta: {
      connectivity: 'native'
    },
    _cpu: {},
    _visualMetrics: {},
    pageTimings: {
      _firstPaint: 100,
      _largestContentfulPaint: 200
    }
  });
});
