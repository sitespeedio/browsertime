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

/**
 * http://msdn.microsoft.com/en-us/library/ie/ff974719(v=vs.85).aspx
 */
public class InternetExplorerDataCollector extends TimingDataCollector {

    @Override
    public void collectTimingData(JavascriptExecutor js, TimingRun results) {
        collectMarks(js, results);
        collectMeasurements(results);
    }

    private void collectMarks(JavascriptExecutor js, TimingRun results) {
        Long time = (Long) js.executeScript("return window.performance.timing.msFirstPaint");
        results.addMark(new TimingMark("msFirstPaint", time));
    }

    private void collectMeasurements(TimingRun results) {
        MarkInterval interval = new MarkInterval("firstPaintTime", "navigationStart", "msFirstPaint");
        interval.collectMeasurement(results);
    }
}
