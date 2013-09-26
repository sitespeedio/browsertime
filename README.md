# Browser Time [![Build Status](https://travis-ci.org/tobli/browsertime.png?branch=master)](https://travis-ci.org/tobli/browsertime)

Guess what? It's browser time! Fetch timings (like the Navigation Timing API data) and other data from your browser (inspired by [wbench](https://github.com/desktoppr/wbench))

## Usage

```
usage: browsertime [options] URL
 -b,--browser <BROWSER>   The browser to use [firefox, chrome, ie],
                          defaults to firefox.
 -f,--format <FORMAT>     Choose output format. [xml, json] , defaults to
                          xml.
 -h,--help                Show this help message
 -n,--times <TIMES>       The number of times to run the test, defaults to
                          3.
 -o,--output <OUTPUT>     Output the result as a file, give the name of
                          the file. If no filename is given, the result is
                          put on standard out.
 -V,--version             Show version information
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

