'use strict';

let builder = require('../../lib/support/har/'),
  expect = require('chai').expect;

describe('har_builder', function() {
  let har;

  beforeEach(function() {
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

  describe('#addCreator', function() {
    it('should add creator if missing', function() {
      builder.addCreator(har, 'foo');

      expect(har).to.have.nested.property('log.creator.name', 'Browsertime');
      expect(har).to.have.nested.property('log.creator.comment', 'foo');
    });

    it('should not add comment to creator unless specified', function() {
      builder.addCreator(har);

      expect(har).to.have.nested.property('log.creator.name', 'Browsertime');
      expect(har).to.not.have.nested.property('log.creator.comment');
    });

    it('should not add empty comment to creator', function() {
      builder.addCreator(har, '');

      expect(har).to.have.nested.property('log.creator.name', 'Browsertime');
      expect(har).to.not.have.nested.property('log.creator.comment');
    });
  });

  describe('#mergeHars', function() {
    it('should merge two hars', function() {
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

      expect(combinedHar.log.pages).to.eql([
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
      expect(combinedHar.log.entries).to.eql([
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
      expect(combinedHar).to.have.nested.property('log.version', '1.2');
      expect(combinedHar).to.have.nested.property(
        'log.creator.name',
        'Browsertime'
      );
    });
  });

  describe('#addExtraFieldsToHar', function() {
    let options;
    let totalResults;

    beforeEach(function() {
      options = {
        iterations: 1
      };
      totalResults = [
        {
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
    });

    it('should gracefully handle missing data', function() {
      builder.addExtraFieldsToHar();
    });

    it('should add visual metrics if given', function() {
      har.log.pages[0].pageTimings = {};
      builder.addExtraFieldsToHar(totalResults, har, options);

      expect(har.log.pages[0]).to.eql({
        id: 'page_0',
        _meta: {
          connectivity: 'native'
        },
        _visualMetrics: {
          SpeedIndex: 100,
          PerceptualSpeedIndex: 200,
          ContentfulSpeedIndex: 300,
          VisualProgress: {
            '0': 0,
            '10': 50,
            '20': 100
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

    it('should gracefully handle missing cpu and visual metrics', function() {
      har.log.pages[0].pageTimings = {};
      totalResults[0].visualMetrics = [];
      totalResults[0].cpu = [{}];
      builder.addExtraFieldsToHar(totalResults, har, options);

      expect(har.log.pages[0]).to.eql({
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
  });
});
