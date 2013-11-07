# Browser Time [![Build Status](https://travis-ci.org/tobli/browsertime.png?branch=master)](https://travis-ci.org/tobli/browsertime)

Guess what? It's browser time! Fetch timings (like the Navigation Timing API data) and other data from your browser (inspired by [wbench](https://github.com/desktoppr/wbench)).


## Usage

```bash
usage: browsertime [options] URL
 -b,--browser <BROWSER>           The browser to use. Supported values
                                  are: [chrome, firefox, ie], default
                                  being firefox.
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
 -t,--timeout <TIMEOUT>           Number of seconds to wait for url to
                                  complete loading before giving up,
                                  default being 60.
 -ua,--user-agent <USER-AGENT>    Set the user agent. Default is the one
                                  by the browser you use. Only works with
                                  Chrome.
 -V,--version                     Show version information
 -w,--window-size <WINDOW-SIZE>   The size of the browser window:
                                  <width>x<height>, e.g. 400x600. Only
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

## Output XML example
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<timingSession>
	<pageData>
		<entry>
			<key>platform</key>
			<value>MAC</value>
		</entry>
		<entry>
			<key>browserVersion</key>
			<value>24.0</value>
		</entry>
		<entry>
			<key>browserName</key>
			<value>firefox</value>
		</entry>
		<entry>
			<key>userAgent</key>
			<value>
				Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36
			</value>
		</entry>
		<entry>
			<key>redirectCount</key>
			<value>0</value>
		</entry>
		<entry>
			<key>windowSize</key>
			<value>1280x716</value>
		</entry>
		<entry>
			<key>actualUrl</key>
			<value>http://www.peterhedenskog.com/</value>
		</entry>
		<entry>
			<key>url</key>
			<value>http://peterhedenskog.com</value>
		</entry>
	</pageData>
	<statistics>
		<statistic>
			<name>serverConnectionTime</name>
			<min>0.0</min>
			<avg>0.0</avg>
			<median>0.0</median>
			<p60>0.0</p60>
			<p70>0.0</p70>
			<p80>0.0</p80>
			<p90>0.0</p90>
			<max>0.0</max>
		</statistic>
		<statistic>
			<name>domainLookupTime</name>
			<min>0.0</min>
			<avg>1.2</avg>
			<median>1.0</median>
			<p60>1.0</p60>
			<p70>1.4000000000000004</p70>
			<p80>2.5999999999999996</p80>
			<p90>3.0</p90>
			<max>3.0</max>
		</statistic>
		<statistic>
			<name>pageLoadTime</name>
			<min>2350.0</min>
			<avg>3662.0</avg>
			<median>2974.0</median>
			<p60>3118.0</p60>
			<p70>4052.600000000001</p70>
			<p80>6568.4</p80>
			<p90>7407.0</p90>
			<max>7407.0</max>
		</statistic>
		<statistic>
			<name>pageDownloadTime</name>
			<min>0.0</min>
			<avg>0.4</avg>
			<median>0.0</median>
			<p60>0.6000000000000001</p60>
			<p70>1.0</p70>
			<p80>1.0</p80>
			<p90>1.0</p90>
			<max>1.0</max>
		</statistic>
		<statistic>
			<name>serverResponseTime</name>
			<min>165.0</min>
			<avg>174.4</avg>
			<median>165.0</median>
			<p60>167.4</p60>
			<p70>176.8</p70>
			<p80>200.2</p80>
			<p90>208.0</p90>
			<max>208.0</max>
		</statistic>
		<statistic>
			<name>domContentLoadedTime</name>
			<min>1353.0</min>
			<avg>2509.6</avg>
			<median>1796.0</median>
			<p60>1906.4</p60>
			<p70>2788.8000000000006</p70>
			<p80>5215.199999999999</p80>
			<p90>6024.0</p90>
			<max>6024.0</max>
		</statistic>
		<statistic>
			<name>domInteractiveTime</name>
			<min>716.0</min>
			<avg>1843.8</avg>
			<median>780.0</median>
			<p60>1295.4</p60>
			<p70>2377.600000000001</p70>
			<p80>4593.4</p80>
			<p90>5332.0</p90>
			<max>5332.0</max>
		</statistic>
		<statistic>
			<name>redirectionTime</name>
			<min>348.0</min>
			<avg>527.6</avg>
			<median>383.0</median>
			<p60>402.8</p60>
			<p70>560.0000000000001</p70>
			<p80>991.9999999999999</p80>
			<p90>1136.0</p90>
			<max>1136.0</max>
		</statistic>
	</statistics>
	<runs>
		<run>
			<marks>
				<mark time="1381168937507" name="fetchStart"/>
				<mark time="1381168939509" name="domComplete"/>
				<mark time="1381168939509" name="loadEventStart"/>
				<mark time="1381168937666" name="requestStart"/>
				<mark time="1381168937159" name="navigationStart"/>
				<mark time="1381168937874" name="responseEnd"/>
				<mark time="1381168937875" name="domLoading"/>
				<mark time="1381168937911" name="domInteractive"/>
				<mark time="1381168938554" name="domContentLoadedEventStart"/>
				<mark time="1381168937508" name="domainLookupEnd"/>
				<mark time="1381168937874" name="responseStart"/>
				<mark time="1381168937507" name="connectEnd"/>
				<mark time="1381168939510" name="loadEventEnd"/>
				<mark time="1381168937507" name="connectStart"/>
				<mark time="1381168938556" name="domContentLoadedEventEnd"/>
				<mark time="1381168937508" name="domainLookupStart"/>
			</marks>
			<measurements>
				<measurement duration="0" time="1381168937508" name="domainLookupTime"/>
				<measurement duration="348" time="1381168937159" name="redirectionTime"/>
				<measurement duration="0" time="1381168937507" name="serverConnectionTime"/>
				<measurement duration="208" time="1381168937666" name="serverResponseTime"/>
				<measurement duration="0" time="1381168937874" name="pageDownloadTime"/>
				<measurement duration="752" time="1381168937159" name="domInteractiveTime"/>
				<measurement duration="1395" time="1381168937159" name="domContentLoadedTime"/>
				<measurement duration="2350" time="1381168937159" name="pageLoadTime"/>
			</measurements>
		</run>
		<run>
			<marks>
				<mark time="1381168952168" name="fetchStart"/>
				<mark time="1381168959192" name="domComplete"/>
				<mark time="1381168959192" name="loadEventStart"/>
				<mark time="1381168952328" name="requestStart"/>
				<mark time="1381168951785" name="navigationStart"/>
				<mark time="1381168952493" name="responseEnd"/>
				<mark time="1381168952493" name="domLoading"/>
				<mark time="1381168957117" name="domInteractive"/>
				<mark time="1381168957809" name="domContentLoadedEventStart"/>
				<mark time="1381168952171" name="domainLookupEnd"/>
				<mark time="1381168952493" name="responseStart"/>
				<mark time="1381168952168" name="connectEnd"/>
				<mark time="1381168959192" name="loadEventEnd"/>
				<mark time="1381168952168" name="connectStart"/>
				<mark time="1381168957811" name="domContentLoadedEventEnd"/>
				<mark time="1381168952168" name="domainLookupStart"/>
			</marks>
			<measurements>
				<measurement duration="3" time="1381168952168" name="domainLookupTime"/>
				<measurement duration="383" time="1381168951785" name="redirectionTime"/>
				<measurement duration="0" time="1381168952168" name="serverConnectionTime"/>
				<measurement duration="165" time="1381168952328" name="serverResponseTime"/>
				<measurement duration="0" time="1381168952493" name="pageDownloadTime"/>
				<measurement duration="5332" time="1381168951785" name="domInteractiveTime"/>
				<measurement duration="6024" time="1381168951785" name="domContentLoadedTime"/>
				<measurement duration="7407" time="1381168951785" name="pageLoadTime"/>
			</measurements>
		</run>
		<run>
			<marks>
				<mark time="1381168974680" name="fetchStart"/>
				<mark time="1381168976629" name="domComplete"/>
				<mark time="1381168976629" name="loadEventStart"/>
				<mark time="1381168974845" name="requestStart"/>
				<mark time="1381168974264" name="navigationStart"/>
				<mark time="1381168975015" name="responseEnd"/>
				<mark time="1381168975016" name="domLoading"/>
				<mark time="1381168975044" name="domInteractive"/>
				<mark time="1381168975617" name="domContentLoadedEventStart"/>
				<mark time="1381168974682" name="domainLookupEnd"/>
				<mark time="1381168975014" name="responseStart"/>
				<mark time="1381168974680" name="connectEnd"/>
				<mark time="1381168976629" name="loadEventEnd"/>
				<mark time="1381168974680" name="connectStart"/>
				<mark time="1381168975619" name="domContentLoadedEventEnd"/>
				<mark time="1381168974681" name="domainLookupStart"/>
			</marks>
			<measurements>
				<measurement duration="1" time="1381168974681" name="domainLookupTime"/>
				<measurement duration="416" time="1381168974264" name="redirectionTime"/>
				<measurement duration="0" time="1381168974680" name="serverConnectionTime"/>
				<measurement duration="169" time="1381168974845" name="serverResponseTime"/>
				<measurement duration="1" time="1381168975014" name="pageDownloadTime"/>
				<measurement duration="780" time="1381168974264" name="domInteractiveTime"/>
				<measurement duration="1353" time="1381168974264" name="domContentLoadedTime"/>
				<measurement duration="2365" time="1381168974264" name="pageLoadTime"/>
			</measurements>
		</run>
		<run>
			<marks>
				<mark time="1381168996882" name="fetchStart"/>
				<mark time="1381168999501" name="domComplete"/>
				<mark time="1381168999501" name="loadEventStart"/>
				<mark time="1381168997044" name="requestStart"/>
				<mark time="1381168996527" name="navigationStart"/>
				<mark time="1381168997210" name="responseEnd"/>
				<mark time="1381168997209" name="domLoading"/>
				<mark time="1381168997243" name="domInteractive"/>
				<mark time="1381168998323" name="domContentLoadedEventStart"/>
				<mark time="1381168996884" name="domainLookupEnd"/>
				<mark time="1381168997209" name="responseStart"/>
				<mark time="1381168996882" name="connectEnd"/>
				<mark time="1381168999501" name="loadEventEnd"/>
				<mark time="1381168996882" name="connectStart"/>
				<mark time="1381168998325" name="domContentLoadedEventEnd"/>
				<mark time="1381168996883" name="domainLookupStart"/>
			</marks>
			<measurements>
				<measurement duration="1" time="1381168996883" name="domainLookupTime"/>
				<measurement duration="355" time="1381168996527" name="redirectionTime"/>
				<measurement duration="0" time="1381168996882" name="serverConnectionTime"/>
				<measurement duration="165" time="1381168997044" name="serverResponseTime"/>
				<measurement duration="1" time="1381168997209" name="pageDownloadTime"/>
				<measurement duration="716" time="1381168996527" name="domInteractiveTime"/>
				<measurement duration="1796" time="1381168996527" name="domContentLoadedTime"/>
				<measurement duration="2974" time="1381168996527" name="pageLoadTime"/>
			</measurements>
		</run>
		<run>
			<marks>
				<mark time="1381169009736" name="fetchStart"/>
				<mark time="1381169011814" name="domComplete"/>
				<mark time="1381169011814" name="loadEventStart"/>
				<mark time="1381169009895" name="requestStart"/>
				<mark time="1381169008600" name="navigationStart"/>
				<mark time="1381169010060" name="responseEnd"/>
				<mark time="1381169010061" name="domLoading"/>
				<mark time="1381169010239" name="domInteractive"/>
				<mark time="1381169010580" name="domContentLoadedEventStart"/>
				<mark time="1381169009738" name="domainLookupEnd"/>
				<mark time="1381169010060" name="responseStart"/>
				<mark time="1381169009736" name="connectEnd"/>
				<mark time="1381169011815" name="loadEventEnd"/>
				<mark time="1381169009736" name="connectStart"/>
				<mark time="1381169010583" name="domContentLoadedEventEnd"/>
				<mark time="1381169009737" name="domainLookupStart"/>
			</marks>
			<measurements>
				<measurement duration="1" time="1381169009737" name="domainLookupTime"/>
				<measurement duration="1136" time="1381169008600" name="redirectionTime"/>
				<measurement duration="0" time="1381169009736" name="serverConnectionTime"/>
				<measurement duration="165" time="1381169009895" name="serverResponseTime"/>
				<measurement duration="0" time="1381169010060" name="pageDownloadTime"/>
				<measurement duration="1639" time="1381169008600" name="domInteractiveTime"/>
				<measurement duration="1980" time="1381169008600" name="domContentLoadedTime"/>
				<measurement duration="3214" time="1381169008600" name="pageLoadTime"/>
			</measurements>
		</run>
	</runs>
</timingSession>
```


## Authors
Tobias Lidskog - https://github.com/tobli - https://twitter.com/tobiaslidskog

Peter Hedenskog - https://github.com/soulgalore - https://twitter.com/soulislove

## Copyright and license

Copyright 2013 Tobias Lidskog & Peter Hedenskog under [the Apache 2.0 license](LICENSE).


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/tobli/browsertime/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

