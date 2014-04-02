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

import java.util.Map;

import net.browsertime.tool.timings.TimingMark;
import net.browsertime.tool.timings.TimingMeasurement;
import net.browsertime.tool.timings.TimingRun;
import org.openqa.selenium.JavascriptExecutor;

/**
 *
 */
public class ChromeDataCollector extends TimingDataCollector {

  @Override
  public void collectPageData(JavascriptExecutor js, Map<String, String> pageInfo) {
    super.collectPageData(js, pageInfo);

    boolean wasFetchedViaSpdy =
        booleanFromJs(js, "return window.chrome.loadTimes().wasFetchedViaSpdy");
    pageInfo.put("wasFetchedViaSpdy", Boolean.toString(wasFetchedViaSpdy));
  }

  @Override
  public void collectTimingData(JavascriptExecutor js, TimingRun results) {
    collectMarks(js, results);
    collectMeasurements(js, results);
  }

  private void collectMarks(JavascriptExecutor js, TimingRun results) {
    // Chrome timing is in seconds, convert it to milliseconds
    double time = doubleFromJs(js, "return window.chrome.loadTimes().firstPaintTime * 1000");
    if (time > 0) { // ignore 0 times, see https://github.com/tobli/browsertime/issues/36
      results.addMark(new TimingMark("firstPaint", time));
    }
  }

  private void collectMeasurements(JavascriptExecutor js, TimingRun results) {
    double start = doubleFromJs(js, "return window.performance.timing.navigationStart");
    double end = doubleFromJs(js, "return window.chrome.loadTimes().firstPaintTime * 1000");

    if (start > 0 && end > 0) {
      TimingMeasurement m = new TimingMeasurement("firstPaintTime", start, end - start);
      results.addMeasurement(m);
    }
  }
}
