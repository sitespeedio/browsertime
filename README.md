# Browsertime [![Build Status](https://travis-ci.org/tobli/browsertime.png?branch=master)](https://travis-ci.org/tobli/browsertime)

Guess what? It's browser time! Fetch timings ([Navigation Timing API](http://kaaes.github.io/timing/info.html) and [User Timing](http://www.html5rocks.com/en/tutorials/webperformance/usertiming/)), [HAR file](http://www.softwareishard.com/blog/har-12-spec/),
[Resource Timing](http://www.w3.org/TR/resource-timing/), first paint & [RUM Speed Index](https://github.com/WPO-Foundation/RUM-SpeedIndex) and other data from your browser.

## Install
```bash
npm install browsertime -g
```

## Usage

```bash
usage: browsertime [options]
 -u the URL to test
 -f Output the result as a file, give the name of the file. If no filename is given, the name will be the domain of the url
 --harFile the HAR file name. If no filename, the name will be $domain.har
 -b The browser to use. Supported values are:chrome,firefox,phantomjs, default being chrome.
 -n the number of times to run the test, default being 3
 --userAgent Set the user agent. Default is the one by the browser you use. Only works with Chrome and Firefox
 -w The size of the browser window: <width>x<height>, e.g. 400x600. Only works with Chrome and Firefox
 --scriptPath the path to an extra script folder.
 --headers set request headers by setting a JSON of the format {name:value,name2:value2}
 --basicAuth {username:$NAME, password:$password}
 --useProxy use MobProxy or not. Use it to get a HAR file.
 --limit the speed by simulating connection types by setting a JSON like {downstreamKbps: $X, upstreamKbps: $Y, latency: $Z}
```

## How to run

1. Run browsertime
```
browsertime -h
```

## Output JSON example
```json
{
  "url": "http://www.sitespeed.io",
  "runs": 2,
  "browserName": "chrome",
  "browserVersion": "38.0.2125.104",
  "platform": "Mac OS X",
  "userAgent": "",
  "windowSize": "unknown",
  "browserTimeVersion": "0.1.0",
  "statistics": [{
    "name": "backEndTime",
    "min": "251",
    "max": "704",
    "p10": "251",
    "p70": "704",
    "p80": "704",
    "p90": "704",
    "p99": "704",
    "median": "478",
    "mean": "478"
  }, {
    "name": "domContentLoadedTime",
    "min": "266",
    "max": "780",
    "p10": "266",
    "p70": "780",
    "p80": "780",
    "p90": "780",
    "p99": "780",
    "median": "523",
    "mean": "523"
  }, {
    "name": "domInteractiveTime",
    "min": "266",
    "max": "780",
    "p10": "266",
    "p70": "780",
    "p80": "780",
    "p90": "780",
    "p99": "780",
    "median": "523",
    "mean": "523"
  }, {
    "name": "domainLookupTime",
    "min": "0",
    "max": "0",
    "p10": "0",
    "p70": "0",
    "p80": "0",
    "p90": "0",
    "p99": "0",
    "median": "0",
    "mean": "0"
  }, {
    "name": "frontEndTime",
    "min": "249",
    "max": "763",
    "p10": "249",
    "p70": "763",
    "p80": "763",
    "p90": "763",
    "p99": "763",
    "median": "506",
    "mean": "506"
  }, {
    "name": "pageDownloadTime",
    "min": "2",
    "max": "44",
    "p10": "2",
    "p70": "44",
    "p80": "44",
    "p90": "44",
    "p99": "44",
    "median": "23",
    "mean": "23"
  }, {
    "name": "pageLoadTime",
    "min": "502",
    "max": "1511",
    "p10": "502",
    "p70": "1511",
    "p80": "1511",
    "p90": "1511",
    "p99": "1511",
    "median": "1007",
    "mean": "1007"
  }, {
    "name": "redirectionTime",
    "min": "154",
    "max": "179",
    "p10": "154",
    "p70": "179",
    "p80": "179",
    "p90": "179",
    "p99": "179",
    "median": "167",
    "mean": "167"
  }, {
    "name": "serverConnectionTime",
    "min": "0",
    "max": "0",
    "p10": "0",
    "p70": "0",
    "p80": "0",
    "p90": "0",
    "p99": "0",
    "median": "0",
    "mean": "0"
  }, {
    "name": "serverResponseTime",
    "min": "62",
    "max": "583",
    "p10": "62",
    "p70": "583",
    "p80": "583",
    "p90": "583",
    "p99": "583",
    "median": "323",
    "mean": "323"
  }, {
    "name": "speedIndex",
    "min": "279",
    "max": "991",
    "p10": "279",
    "p70": "991",
    "p80": "991",
    "p90": "991",
    "p99": "991",
    "median": "635",
    "mean": "635"
  }, {
    "name": "firstPaint",
    "min": "251",
    "max": "704",
    "p10": "251",
    "p70": "704",
    "p80": "704",
    "p90": "704",
    "p99": "704",
    "median": "478",
    "mean": "478"
  }, {
    "name": "headerTime",
    "min": "287",
    "max": "718",
    "p10": "287",
    "p70": "718",
    "p80": "718",
    "p90": "718",
    "p99": "718",
    "median": "502",
    "mean": "502"
  }, {
    "name": "logoTime",
    "min": "383",
    "max": "1532",
    "p10": "383",
    "p70": "1532",
    "p80": "1532",
    "p90": "1532",
    "p99": "1532",
    "median": "958",
    "mean": "958"
  }],
  "data": [{
    "firstPaint": 704,
    "navigation": {
      "connectEnd": 1414356675770,
      "connectStart": 1414356675770,
      "domComplete": 1414356677115,
      "domContentLoadedEventEnd": 1414356676385,
      "domContentLoadedEventStart": 1414356676385,
      "domInteractive": 1414356676385,
      "domLoading": 1414356676311,
      "domainLookupEnd": 1414356675759,
      "domainLookupStart": 1414356675759,
      "fetchStart": 1414356675759,
      "loadEventEnd": 1414356677124,
      "loadEventStart": 1414356677116,
      "navigationStart": 1414356675605,
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 1414356675770,
      "responseEnd": 1414356676353,
      "responseStart": 1414356676309,
      "secureConnectionStart": 0,
      "unloadEventEnd": 0,
      "unloadEventStart": 0
    },
    "resources": [{
      "connectEnd": 0,
      "connectStart": 0,
      "domainLookupEnd": 0,
      "domainLookupStart": 0,
      "duration": 98.1000000028871,
      "entryType": "resource",
      "fetchStart": 717.517999990378,
      "initiatorType": "script",
      "name": "http://www.google-analytics.com/ga.js",
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 0,
      "responseEnd": 815.617999993265,
      "responseStart": 0,
      "secureConnectionStart": 0,
      "startTime": 717.517999990378
    }, {
      "connectEnd": 718.656000011833,
      "connectStart": 718.355999997584,
      "domainLookupEnd": 717.780000006314,
      "domainLookupStart": 717.780000006314,
      "duration": 516.322000010405,
      "entryType": "resource",
      "fetchStart": 717.780000006314,
      "initiatorType": "img",
      "name": "http://www.sitespeed.io/img/sitespeed-logo-2c.png",
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 718.75299999374,
      "responseEnd": 1234.10200001672,
      "responseStart": 1233.18400001153,
      "secureConnectionStart": 0,
      "startTime": 717.780000006314
    }, {
      "connectEnd": 771.379999991041,
      "connectStart": 771.379999991041,
      "domainLookupEnd": 771.379999991041,
      "domainLookupStart": 771.379999991041,
      "duration": 300.935000006575,
      "entryType": "resource",
      "fetchStart": 771.379999991041,
      "initiatorType": "img",
      "name": "http://www.sitespeed.io/img/forkme_right_green_007200.png",
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 772.471000003861,
      "responseEnd": 1072.31499999762,
      "responseStart": 1071.31999998819,
      "secureConnectionStart": 0,
      "startTime": 771.379999991041
    }, {
      "connectEnd": 772.682999988319,
      "connectStart": 772.277999989456,
      "domainLookupEnd": 771.590999996988,
      "domainLookupStart": 771.590999996988,
      "duration": 738.581000012346,
      "entryType": "resource",
      "fetchStart": 771.590999996988,
      "initiatorType": "img",
      "name": "http://www.sitespeed.io/img/sitespeed.io-logo-large2.png",
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 772.816999990027,
      "responseEnd": 1510.17200000933,
      "responseStart": 1456.76999998977,
      "secureConnectionStart": 0,
      "startTime": 771.590999996988
    }, {
      "connectEnd": 781.151000002865,
      "connectStart": 780.881999991834,
      "domainLookupEnd": 780.308000015793,
      "domainLookupStart": 780.308000015793,
      "duration": 305.884000001242,
      "entryType": "resource",
      "fetchStart": 780.308000015793,
      "initiatorType": "script",
      "name": "http://www.sitespeed.io/js/all.js",
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 781.191999994917,
      "responseEnd": 1086.19200001704,
      "responseStart": 936.469000007492,
      "secureConnectionStart": 0,
      "startTime": 780.308000015793
    }, {
      "connectEnd": 0,
      "connectStart": 0,
      "domainLookupEnd": 0,
      "domainLookupStart": 0,
      "duration": 42.7489999856334,
      "entryType": "resource",
      "fetchStart": 844.729000004008,
      "initiatorType": "img",
      "name": "http://www.google-analytics.com/r/__utm.gif?utmwv=5.6.0&utms=1&utmn=1176181004&utmhn=www.sitespeed.io&utmcs=UTF-8&utmsr=1440x900&utmvp=1050x757&utmsc=24-bit&utmul=en-us&utmje=1&utmfl=15.0%20r0&utmdt=Sitespeed.io%20-%20Analyze%20your%20website%20speed%20and%20performance&utmhid=1788259701&utmr=-&utmp=%2F&utmht=1414356676446&utmac=UA-31246987-1&utmcc=__utma%3D152498875.1393148329.1414356676.1414356676.1414356676.1%3B%2B__utmz%3D152498875.1414356676.1.1.utmcsr%3D(direct)%7Cutmccn%3D(direct)%7Cutmcmd%3D(none)%3B&utmjid=977475387&utmredir=1&utmu=qAAAAAAAAAAAAAAAAAAAAAAE~",
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 0,
      "responseEnd": 887.477999989642,
      "responseStart": 0,
      "secureConnectionStart": 0,
      "startTime": 844.729000004008
    }],
    "speedIndex": 990.912020896956,
    "timings": {
      "backEndTime": 704,
      "domContentLoadedTime": 780,
      "domInteractiveTime": 780,
      "domainLookupTime": 0,
      "frontEndTime": 763,
      "pageDownloadTime": 44,
      "pageLoadTime": 1511,
      "redirectionTime": 154,
      "serverConnectionTime": 0,
      "serverResponseTime": 583
    },
    "userTiming": {
      "marks": [{
        "duration": 0,
        "entryType": "mark",
        "name": "headerTime",
        "startTime": 718.075000011595
      }, {
        "duration": 0,
        "entryType": "mark",
        "name": "logoTime",
        "startTime": 1532.01500000432
      }],
      "measures": []
    }
  }, {
    "firstPaint": 251,
    "navigation": {
      "connectEnd": 1414356678190,
      "connectStart": 1414356678190,
      "domComplete": 1414356678501,
      "domContentLoadedEventEnd": 1414356678265,
      "domContentLoadedEventStart": 1414356678265,
      "domInteractive": 1414356678265,
      "domLoading": 1414356678252,
      "domainLookupEnd": 1414356678178,
      "domainLookupStart": 1414356678178,
      "fetchStart": 1414356678178,
      "loadEventEnd": 1414356678507,
      "loadEventStart": 1414356678501,
      "navigationStart": 1414356677999,
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 1414356678190,
      "responseEnd": 1414356678252,
      "responseStart": 1414356678250,
      "secureConnectionStart": 0,
      "unloadEventEnd": 0,
      "unloadEventStart": 0
    },
    "resources": [{
      "connectEnd": 0,
      "connectStart": 0,
      "domainLookupEnd": 0,
      "domainLookupStart": 0,
      "duration": 30.0609999976587,
      "entryType": "resource",
      "fetchStart": 264.595000015106,
      "initiatorType": "script",
      "name": "http://www.google-analytics.com/ga.js",
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 0,
      "responseEnd": 294.656000012765,
      "responseStart": 0,
      "secureConnectionStart": 0,
      "startTime": 264.595000015106
    }, {
      "connectEnd": 264.871999999741,
      "connectStart": 264.871999999741,
      "domainLookupEnd": 264.871999999741,
      "domainLookupStart": 264.871999999741,
      "duration": 58.084999996936,
      "entryType": "resource",
      "fetchStart": 264.871999999741,
      "initiatorType": "img",
      "name": "http://www.sitespeed.io/img/sitespeed-logo-2c.png",
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 265.555999998469,
      "responseEnd": 322.956999996677,
      "responseStart": 322.332999989158,
      "secureConnectionStart": 0,
      "startTime": 264.871999999741
    }, {
      "connectEnd": 266.935999999987,
      "connectStart": 266.258999996353,
      "domainLookupEnd": 265.244999987772,
      "domainLookupStart": 265.244999987772,
      "duration": 61.4460000069812,
      "entryType": "resource",
      "fetchStart": 265.244999987772,
      "initiatorType": "img",
      "name": "http://www.sitespeed.io/img/forkme_right_green_007200.png",
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 267.078000004403,
      "responseEnd": 326.690999994753,
      "responseStart": 325.586999999359,
      "secureConnectionStart": 0,
      "startTime": 265.244999987772
    }, {
      "connectEnd": 266.984000016237,
      "connectStart": 266.392999998061,
      "domainLookupEnd": 265.393000008771,
      "domainLookupStart": 265.393000008771,
      "duration": 61.1309999949299,
      "entryType": "resource",
      "fetchStart": 265.393000008771,
      "initiatorType": "img",
      "name": "http://www.sitespeed.io/img/sitespeed.io-logo-large2.png",
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 267.099999997299,
      "responseEnd": 326.524000003701,
      "responseStart": 325.024999998277,
      "secureConnectionStart": 0,
      "startTime": 265.393000008771
    }, {
      "connectEnd": 266.815999988467,
      "connectStart": 266.681000008248,
      "domainLookupEnd": 265.806000010343,
      "domainLookupStart": 265.806000010343,
      "duration": 204.44599998882,
      "entryType": "resource",
      "fetchStart": 265.806000010343,
      "initiatorType": "script",
      "name": "http://www.sitespeed.io/js/all.js",
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 267.04899998731,
      "responseEnd": 470.251999999164,
      "responseStart": 320.991000015056,
      "secureConnectionStart": 0,
      "startTime": 265.806000010343
    }, {
      "connectEnd": 0,
      "connectStart": 0,
      "domainLookupEnd": 0,
      "domainLookupStart": 0,
      "duration": 36.9839999766555,
      "entryType": "resource",
      "fetchStart": 382.742000016151,
      "initiatorType": "img",
      "name": "http://www.google-analytics.com/r/__utm.gif?utmwv=5.6.0&utms=1&utmn=1318877826&utmhn=www.sitespeed.io&utmcs=UTF-8&utmsr=1440x900&utmvp=1050x757&utmsc=24-bit&utmul=en-us&utmje=1&utmfl=15.0%20r0&utmdt=Sitespeed.io%20-%20Analyze%20your%20website%20speed%20and%20performance&utmhid=1226195563&utmr=-&utmp=%2F&utmht=1414356678378&utmac=UA-31246987-1&utmcc=__utma%3D152498875.1081329964.1414356678.1414356678.1414356678.1%3B%2B__utmz%3D152498875.1414356678.1.1.utmcsr%3D(direct)%7Cutmccn%3D(direct)%7Cutmcmd%3D(none)%3B&utmjid=1634437970&utmredir=1&utmu=qAAAAAAAAAAAAAAAAAAAAAAE~",
      "redirectEnd": 0,
      "redirectStart": 0,
      "requestStart": 0,
      "responseEnd": 419.725999992806,
      "responseStart": 0,
      "secureConnectionStart": 0,
      "startTime": 382.742000016151
    }],
    "speedIndex": 279.375857895886,
    "timings": {
      "backEndTime": 251,
      "domContentLoadedTime": 266,
      "domInteractiveTime": 266,
      "domainLookupTime": 0,
      "frontEndTime": 249,
      "pageDownloadTime": 2,
      "pageLoadTime": 502,
      "redirectionTime": 179,
      "serverConnectionTime": 0,
      "serverResponseTime": 62
    },
    "userTiming": {
      "marks": [{
        "duration": 0,
        "entryType": "mark",
        "name": "headerTime",
        "startTime": 286.812000005739
      }, {
        "duration": 0,
        "entryType": "mark",
        "name": "logoTime",
        "startTime": 383.376999991015
      }],
      "measures": []
    }
  }]
}
```


## Authors
Tobias Lidskog - https://github.com/tobli - https://twitter.com/tobiaslidskog

Peter Hedenskog - https://github.com/soulgalore - https://twitter.com/soulislove

## Copyright and license

Copyright 2014 Tobias Lidskog & Peter Hedenskog under [the Apache 2.0 license](LICENSE).
