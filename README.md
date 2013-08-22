# Measure your page speed

Measure your page speed using the Navigation Timing API (using Java). Inspired by https://github.com/desktoppr/wbench

## What?
This is a really early version right now, give it a couple of weeks and it will be fully functional :)

## Usage

```
usage: FetchNavigationTiming [-b <BROWSER>] [-f <FORMAT>] [-i <INCLUDE>] [-t <TIMES>] -u <URL>
 -b,--browser <BROWSER>   The browser to use [chrome|firefox|ie]. Firefox is the default one.
 -f,--format <FORMAT>     Choose output format. [xml|json]. xml is default.
 -i,--include <INCLUDE>   Include individual runs in the data output. [true|false]. Exclude is default.
 -t,--times <TIMES>       The number of times to run the test. Default is 3 times.
 -u,--url <URL>           The URL to test
```

## How to run 

1. Build the project
```
mvn package
```

2. Run the full jar like this
```
java -jar navigation-0.1-SNAPSHOT-full.jar -u http://peterhedenskog.com
```


