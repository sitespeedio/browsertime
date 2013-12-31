# Browsertime [![Build Status](https://travis-ci.org/tobli/browsertime.png?branch=master)](https://travis-ci.org/tobli/browsertime)

Guess what? It's browser time! Fetch timings (like the Navigation Timing API data) and other data from your browser (inspired by [wbench](https://github.com/desktoppr/wbench)).


## Usage

```bash
usage: browsertime [options] URL
 -b,--browser <BROWSER>           The browser to use. Supported values
                                  are: [chrome, firefox, ie], default
                                  being firefox.
    --compact                     Generate compact output (default is
                                  pretty-printed).
 -f,--format <FORMAT>             The desired output format. Supported
                                  values are: [xml, json], default being
                                  xml.
 -h,--help                        Show this help message
 -n,--times <TIMES>               The number of times to run the test,
                                  default being 3.
 -o,--output <OUTPUT>             Output the result as a file, give the
                                  name of the file. If no filename is
                                  given, the result is put on standard
                                  out.
 -p,--proxyHost <PROXYHOST>       Proxy server host (including optional
                                  port) to use for http requests in
                                  browser, e.g. proxy.myserver.com:1234.
    --raw                         Include raw metrics data from each test
                                  run (excluded by default).
 -t,--timeout <TIMEOUT>           Number of seconds to wait for url to
                                  complete loading before giving up,
                                  default being 60.
 -ua,--user-agent <USER-AGENT>    Set the user agent. Default is the one
                                  by the browser you use. Only works with
                                  Chrome and Firefox.
 -V,--version                     Show version information
 -w,--window-size <WINDOW-SIZE>   The size of the browser window:
                                  <width>x<height>, e.g. 400x600. Only
                                  works with Chrome and Firefox.
```

## How to run 

### Install via homebrew on mac

1. Install browsertime
```
brew install tobli/browsertime/browsertime
```

1. Run browsertime
```
browsertime -h
```

### Download a release

1. Download the latest zip or tar.gz release from https://github.com/tobli/browsertime/releases

1. Uncompress and run the browsertime script from the bin folder in the distribution (or add the bin folder to your PATH)


### Build from source

1. Build the project
```
mvn package
```

1. Unpack distribution zip file
```
unzip target/browsertime-0.5.zip -d ~
```

1. Run the browsertime command (optionally adding it to your PATH)
```
~/browsertime-0.5/bin/browsertime https://google.com
```

## Output JSON example
```json
{
  "pageData": {
    "platform": "MAC",
    "browserVersion": "31.0.1650.63",
    "browserName": "chrome",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36",
    "redirectCount": "0",
    "browserTimeVersion": "0.5-SNAPSHOT",
    "windowSize": "1050x758",
    "wasFetchedViaSpdy": "false",
    "actualUrl": "https://github.com/tobli/browsertime",
    "url": "http://www.browsertime.net"
  },
  "timingRuns": [
    {
      "marks": [
        {
          "name": "navigationStart",
          "startTime": "1388444088637"
        },
        {
          "name": "fetchStart",
          "startTime": "1388444089513"
        },
        {
          "name": "domainLookupStart",
          "startTime": "1388444089514"
        },
        {
          "name": "domainLookupEnd",
          "startTime": "1388444089535"
        },
        {
          "name": "connectStart",
          "startTime": "1388444089535"
        },
        {
          "name": "secureConnectionStart",
          "startTime": "1388444089663"
        },
        {
          "name": "connectEnd",
          "startTime": "1388444089980"
        },
        {
          "name": "requestStart",
          "startTime": "1388444089981"
        },
        {
          "name": "responseStart",
          "startTime": "1388444090371"
        },
        {
          "name": "responseEnd",
          "startTime": "1388444090385"
        },
        {
          "name": "domLoading",
          "startTime": "1388444090385"
        },
        {
          "name": "firstPaint",
          "startTime": "1388444090441.146"
        },
        {
          "name": "domInteractive",
          "startTime": "1388444091755"
        },
        {
          "name": "domContentLoadedEventStart",
          "startTime": "1388444091755"
        },
        {
          "name": "domContentLoadedEventEnd",
          "startTime": "1388444091939"
        },
        {
          "name": "domComplete",
          "startTime": "1388444092869"
        },
        {
          "name": "loadEventStart",
          "startTime": "1388444092869"
        },
        {
          "name": "loadEventEnd",
          "startTime": "1388444092870"
        }
      ],
      "measurements": [
        {
          "name": "redirectionTime",
          "startTime": "1388444088637",
          "duration": "876"
        },
        {
          "name": "domainLookupTime",
          "startTime": "1388444089514",
          "duration": "21"
        },
        {
          "name": "serverConnectionTime",
          "startTime": "1388444089535",
          "duration": "445"
        },
        {
          "name": "serverResponseTime",
          "startTime": "1388444089981",
          "duration": "390"
        },
        {
          "name": "backEndTime",
          "startTime": "1388444088637",
          "duration": "1734"
        },
        {
          "name": "pageDownloadTime",
          "startTime": "1388444090371",
          "duration": "14"
        },
        {
          "name": "firstPaintTime",
          "startTime": "1388444088637",
          "duration": "1804.145996"
        },
        {
          "name": "domInteractiveTime",
          "startTime": "1388444088637",
          "duration": "3118"
        },
        {
          "name": "domContentLoadedTime",
          "startTime": "1388444088637",
          "duration": "3118"
        },
        {
          "name": "pageLoadTime",
          "startTime": "1388444088637",
          "duration": "4232"
        },
        {
          "name": "frontEndTime",
          "startTime": "1388444090385",
          "duration": "2484"
        }
      ],
      "resourceMeasurements": [
        {
          "name": "https://github.global.ssl.fastly.net/images/spinners/octocat-spinner-32.gif",
          "startTime": "1603.528",
          "duration": "406.557",
          "initiatorType": "img",
          "fetchStart": "1603.528",
          "responseEnd": "2010.085"
        },
        {
          "name": "https://github.global.ssl.fastly.net/assets/github-3944f96c1c19f752fe766b332fb7716555c8296e.css",
          "startTime": "1601.469",
          "duration": "663.174",
          "initiatorType": "link",
          "fetchStart": "1601.469",
          "responseEnd": "2264.643"
        },
        {
          "name": "https://github.global.ssl.fastly.net/assets/github2-b64d0ad5fa62a30a166145ae08b8c0a6d2f7dea7.css",
          "startTime": "1601.59",
          "duration": "1083.959",
          "initiatorType": "link",
          "fetchStart": "1601.59",
          "responseEnd": "2685.549"
        },
        {
          "name": "https://1.gravatar.com/avatar/dfb236c2d968fbbf6fa4dd7d0541b6b6?d\u003dhttps%3A%2F%2Fidenticons.github.com%2F5c4be12e9c0f6d195fcfbcbe41da6187.png\u0026r\u003dx\u0026s\u003d140",
          "startTime": "1603.699",
          "duration": "1157.098",
          "initiatorType": "img",
          "fetchStart": "1603.699",
          "responseEnd": "2760.797"
        },
        {
          "name": "https://github.global.ssl.fastly.net/assets/frameworks-29a3fb0547e33bd8d4530bbad9bae3ef00d83293.js",
          "startTime": "1601.754",
          "duration": "1185.659",
          "initiatorType": "script",
          "fetchStart": "1601.754",
          "responseEnd": "2787.413"
        },
        {
          "name": "https://github.global.ssl.fastly.net/assets/github-3fbe2841590c916eeba07af3fc626dd593d2f5ba.js",
          "startTime": "1601.89",
          "duration": "1281.381",
          "initiatorType": "script",
          "fetchStart": "1601.89",
          "responseEnd": "2883.271"
        },
        {
          "name": "https://d2weczhvl823v0.cloudfront.net/tobli/browsertime/trend.png",
          "startTime": "1605.221",
          "duration": "1512.023",
          "initiatorType": "img",
          "fetchStart": "1605.221",
          "responseEnd": "3117.244"
        },
        {
          "name": "https://github.global.ssl.fastly.net/assets/octicons-bccfe7abf7461ed10568dd044425080f7de09889.woff",
          "startTime": "2707.669",
          "duration": "606.053",
          "initiatorType": "css",
          "fetchStart": "2707.669",
          "responseEnd": "3313.722"
        },
        {
          "name": "https://collector-cdn.github.com/assets/api.js",
          "startTime": "3062.372",
          "duration": "263.186",
          "initiatorType": "script",
          "fetchStart": "3062.372",
          "responseEnd": "3325.558"
        },
        {
          "name": "https://ssl.google-analytics.com/ga.js",
          "startTime": "2919.953",
          "duration": "573.818",
          "initiatorType": "script",
          "fetchStart": "2919.953",
          "responseEnd": "3493.771"
        },
        {
          "name": "https://github.global.ssl.fastly.net/flash/ZeroClipboard.v1.2.1.swf?nocache\u003d1388444091923",
          "startTime": "3375.462",
          "duration": "136.626",
          "initiatorType": "",
          "fetchStart": "3375.462",
          "responseEnd": "3512.088"
        },
        {
          "name": "https://ssl.google-analytics.com/__utm.gif?utmwv\u003d5.4.6\u0026utms\u003d1\u0026utmn\u003d1027905109\u0026utmhn\u003dgithub.com\u0026utme\u003d8(Session%20Type)9(Logged%20Out)11(2)\u0026utmcs\u003dUTF-8\u0026utmsr\u003d1440x900\u0026utmvp\u003d1050x758\u0026utmsc\u003d24-bit\u0026utmul\u003dsv\u0026utmje\u003d1\u0026utmfl\u003d11.9%20r900\u0026utmdt\u003dtobli%2Fbrowsertime%20%C2%B7%20GitHub\u0026utmhid\u003d812045877\u0026utmr\u003d-\u0026utmp\u003d%2Ftobli%2Fbrowsertime\u0026utmht\u003d1388444092301\u0026utmac\u003dUA-3769691-2\u0026utmcc\u003d__utma%3D1.18210696.1388444092.1388444092.1388444092.1%3B%2B__utmz%3D1.1388444092.1.1.utmcsr%3D(direct)%7Cutmccn%3D(direct)%7Cutmcmd%3D(none)%3B\u0026utmu\u003dqR~",
          "startTime": "3516.643",
          "duration": "166.144",
          "initiatorType": "img",
          "fetchStart": "3516.643",
          "responseEnd": "3682.787"
        },
        {
          "name": "https://travis-ci.org/tobli/browsertime.png?branch\u003dmaster",
          "startTime": "3378.647",
          "duration": "595.457",
          "initiatorType": "img",
          "fetchStart": "3378.647",
          "responseEnd": "3974.104"
        },
        {
          "name": "https://collector.githubapp.com/github/page_view?dimensions[page]\u003dhttps%3A%2F%2Fgithub.com%2Ftobli%2Fbrowsertime\u0026dimensions[title]\u003dtobli%2Fbrowsertime%20%C2%B7%20GitHub\u0026dimensions[referrer]\u003d\u0026dimensions[user_agent]\u003dMozilla%2F5.0%20(Macintosh%3B%20Intel%20Mac%20OS%20X%2010_9_1)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F31.0.1650.63%20Safari%2F537.36\u0026dimensions[screen_resolution]\u003d1440x900\u0026dimensions[pixel_ratio]\u003d2\u0026dimensions[browser_resolution]\u003d1050x758\u0026dimensions[tz_seconds]\u003d3600\u0026dimensions[timestamp]\u003d1388444092213\u0026dimensions[request_id]\u003d5AE60903%3A3C32%3A13CF05%3A52C1F9BA\u0026dimensions[user_id]\u003d540266\u0026dimensions[user_login]\u003dtobli\u0026dimensions[repository_id]\u003d12298355\u0026dimensions[repository_nwo]\u003dtobli%2Fbrowsertime\u0026dimensions[repository_public]\u003dtrue\u0026dimensions[repository_is_fork]\u003dfalse\u0026dimensions[repository_network_root_id]\u003d12298355\u0026dimensions[repository_network_root_nwo]\u003dtobli%2Fbrowsertime\u0026\u0026measures[performance_timing]\u003d1-1343-898--3302-3118-3118-1748-898-877-876---0---1344-1748-1734-1026--\u0026\u0026",
          "startTime": "3429.054",
          "duration": "654.704",
          "initiatorType": "img",
          "fetchStart": "3429.054",
          "responseEnd": "4083.758"
        },
        {
          "name": "https://github.com/_stats",
          "startTime": "4088.959",
          "duration": "162.034",
          "initiatorType": "xmlhttprequest",
          "fetchStart": "4088.959",
          "domainLookupStart": "4088.959",
          "domainLookupEnd": "4088.959",
          "connectStart": "4088.959",
          "connectEnd": "4088.959",
          "requestStart": "4089.536",
          "responseStart": "4248.542",
          "responseEnd": "4250.993"
        }
      ]
    }
  ],
  "statistics": [
    {
      "name": "redirectionTime",
      "min": "876",
      "avg": "876",
      "median": "876",
      "p60": "876",
      "p70": "876",
      "p80": "876",
      "p90": "876",
      "max": "876"
    },
    {
      "name": "domainLookupTime",
      "min": "21",
      "avg": "21",
      "median": "21",
      "p60": "21",
      "p70": "21",
      "p80": "21",
      "p90": "21",
      "max": "21"
    },
    {
      "name": "serverConnectionTime",
      "min": "445",
      "avg": "445",
      "median": "445",
      "p60": "445",
      "p70": "445",
      "p80": "445",
      "p90": "445",
      "max": "445"
    },
    {
      "name": "serverResponseTime",
      "min": "390",
      "avg": "390",
      "median": "390",
      "p60": "390",
      "p70": "390",
      "p80": "390",
      "p90": "390",
      "max": "390"
    },
    {
      "name": "backEndTime",
      "min": "1734",
      "avg": "1734",
      "median": "1734",
      "p60": "1734",
      "p70": "1734",
      "p80": "1734",
      "p90": "1734",
      "max": "1734"
    },
    {
      "name": "pageDownloadTime",
      "min": "14",
      "avg": "14",
      "median": "14",
      "p60": "14",
      "p70": "14",
      "p80": "14",
      "p90": "14",
      "max": "14"
    },
    {
      "name": "firstPaintTime",
      "min": "1804.145996",
      "avg": "1804.145996",
      "median": "1804.145996",
      "p60": "1804.145996",
      "p70": "1804.145996",
      "p80": "1804.145996",
      "p90": "1804.145996",
      "max": "1804.145996"
    },
    {
      "name": "domInteractiveTime",
      "min": "3118",
      "avg": "3118",
      "median": "3118",
      "p60": "3118",
      "p70": "3118",
      "p80": "3118",
      "p90": "3118",
      "max": "3118"
    },
    {
      "name": "domContentLoadedTime",
      "min": "3118",
      "avg": "3118",
      "median": "3118",
      "p60": "3118",
      "p70": "3118",
      "p80": "3118",
      "p90": "3118",
      "max": "3118"
    },
    {
      "name": "pageLoadTime",
      "min": "4232",
      "avg": "4232",
      "median": "4232",
      "p60": "4232",
      "p70": "4232",
      "p80": "4232",
      "p90": "4232",
      "max": "4232"
    },
    {
      "name": "frontEndTime",
      "min": "2484",
      "avg": "2484",
      "median": "2484",
      "p60": "2484",
      "p70": "2484",
      "p80": "2484",
      "p90": "2484",
      "max": "2484"
    }
  ]
}
```


## Authors
Tobias Lidskog - https://github.com/tobli - https://twitter.com/tobiaslidskog

Peter Hedenskog - https://github.com/soulgalore - https://twitter.com/soulislove

## Copyright and license

Copyright 2013 Tobias Lidskog & Peter Hedenskog under [the Apache 2.0 license](LICENSE).


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/tobli/browsertime/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

