# Browser Time [![Build Status](https://travis-ci.org/tobli/browsertime.png?branch=master)](https://travis-ci.org/tobli/browsertime)

Guess what? It's browser time! Fetch timings (like the Navigation Timing API data) and other data from your browser (inspired by [wbench](https://github.com/desktoppr/wbench)).


## Usage

```bash
usage: browsertime [options] URL
 -b,--browser <BROWSER>           The browser to use. Supported values are: [chrome, firefox, ie], default
                                  being firefox.
 -f,--format <FORMAT>             The desired output format. Supported values are: [xml, json], default being
                                  xml.
 -h,--help                        Show this help message
 -n,--times <TIMES>               The number of times to run the test, default being 3.
 -o,--output <OUTPUT>             Output the result as a file, give the name of the file. If no filename is
                                  given, the result is put on standard out.
 -ua,--user-agent <USER-AGENT>    Set the user agent. Default is the one by the browser you use. Only works with 
                                  Chrome.
 -V,--version                     Show version information
 -w,--window-size <WINDOW-SIZE>   The size of the browser window: <width>x<height>, e.g. 400x600. Only
                                  works with Chrome and Firefox.
```

## How to run 

1. Build the project
```
mvn package
```

2. Run the full jar like this
```
java -jar browsertime-X.Y-SNAPSHOT-full.jar https://github.com
```

## Authors
Tobias Lidskog - https://github.com/tobli - https://twitter.com/tobiaslidskog

Peter Hedenskog - https://github.com/soulgalore - https://twitter.com/soulislove

## Copyright and license

Copyright 2013 Tobias Lidskog & Peter Hedenskog under [the Apache 2.0 license](LICENSE).
