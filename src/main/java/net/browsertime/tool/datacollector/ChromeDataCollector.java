 /*******************************************************************************************************************************
 * It's Browser Time!
 * 
 *
 * Copyright (C) 2013 by Tobias Lidskog (https://twitter.com/tobiaslidskog) &  Peter Hedenskog (http://peterhedenskog.com)
 *
 ********************************************************************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in 
 * compliance with the License. You may obtain a copy of the License at
 * 
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is 
 * distributed  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   
 * See the License for the specific language governing permissions and limitations under the License.
 *
 ********************************************************************************************************************************
 */
package net.browsertime.tool.datacollector;

import net.browsertime.tool.timings.TimingMark;
import net.browsertime.tool.timings.TimingRun;

import org.openqa.selenium.JavascriptExecutor;

import java.util.Map;

/**
 *
 */
public class ChromeDataCollector extends TimingDataCollector {

    @Override
    public void collectPageData(JavascriptExecutor js, Map<String, String> pageInfo) {
        super.collectPageData(js, pageInfo);

        Boolean wasFetchedViaSpdy = (Boolean) js
                .executeScript("return window.chrome.loadTimes().wasFetchedViaSpdy");
        pageInfo.put("wasFetchedViaSpdy", Boolean.toString(wasFetchedViaSpdy));
    }

    @Override
    public void collectTimingData(JavascriptExecutor js, TimingRun results) {
        collectMarks(js, results);
        collectMeasurements(results);
    }

    private void collectMarks(JavascriptExecutor js, TimingRun results) {
        // Chrome timing is in s.ms, convert it to ms!!
        Double time = (Double) js.executeScript("return window.chrome.loadTimes().firstPaintTime");
        results.addMark(new TimingMark("firstPaint", time * 1000));
    }

    private void collectMeasurements(TimingRun results) {
        MarkInterval interval = new MarkInterval("firstPaintTime", "navigationStart", "firstPaint");
        interval.collectMeasurement(results);
    }
}
