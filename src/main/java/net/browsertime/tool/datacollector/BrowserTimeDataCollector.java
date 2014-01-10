/*******************************************************************************************************************************
 * It's Browser Time!
 * 
 * 
 * Copyright (C) 2013 by Tobias Lidskog (https://twitter.com/tobiaslidskog) & Peter Hedenskog
 * (http://peterhedenskog.com)
 * 
 ******************************************************************************************************************************** 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 * 
 ******************************************************************************************************************************** 
 */
package net.browsertime.tool.datacollector;

import net.browsertime.tool.timings.TimingRun;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import java.util.List;
import java.util.Map;

/**
 * Custom data defined by browser time.
 */
public class BrowserTimeDataCollector extends TimingDataCollector {

  private static final MarkInterval[] intervals = {
      // The following is the standard from GA
      new MarkInterval("domainLookupTime", "domainLookupStart", "domainLookupEnd"),
      new MarkInterval("redirectionTime", "navigationStart", "fetchStart"),
      new MarkInterval("serverConnectionTime", "connectStart", "connectEnd"),
      new MarkInterval("serverResponseTime", "requestStart", "responseStart"),
      new MarkInterval("pageDownloadTime", "responseStart", "responseEnd"),
      new MarkInterval("domInteractiveTime", "navigationStart", "domInteractive"),
      new MarkInterval("domContentLoadedTime", "navigationStart", "domContentLoadedEventStart"),
      new MarkInterval("pageLoadTime", "navigationStart", "loadEventStart"),
      // these two are extras to make it easy to compare
      new MarkInterval("frontEndTime", "responseEnd", "loadEventStart"),
      new MarkInterval("backEndTime", "navigationStart", "responseStart"),};

  @Override
  public void collectPageData(JavascriptExecutor js, Map<String, String> pageInfo) {
    // This won't give proper url in case in connections error
    if (js instanceof WebDriver) {
      pageInfo.put("actualUrl", ((WebDriver) js).getCurrentUrl());
    }

    if (js instanceof HasCapabilities) {
      Capabilities caps = ((HasCapabilities) js).getCapabilities();
      pageInfo.put("browserName", caps.getBrowserName());
      pageInfo.put("browserVersion", caps.getVersion());
      pageInfo.put("platform", caps.getPlatform().name());
    }

    pageInfo.put("userAgent", stringFromJs(js, "return window.navigator.userAgent"));
    List size =
        listFromJs(
            js,
            "var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],"
                + "x=w.innerWidth||e.clientWidth||g.clientWidth,y=w.innerHeight||e.clientHeight||g.clientHeight;"
                + "return [x,y];");
    pageInfo.put("windowSize", String.valueOf(size.get(0)) + "x" + String.valueOf(size.get(1)));

    String implementationVersion = getClass().getPackage().getImplementationVersion();
    implementationVersion = implementationVersion != null ? implementationVersion : "unknown";
    pageInfo.put("browserTimeVersion", implementationVersion);
  }

  @Override
  public void collectTimingData(JavascriptExecutor js, TimingRun results) {
    for (MarkInterval interval : intervals) {
      interval.collectMeasurement(results);
    }
  }

}
