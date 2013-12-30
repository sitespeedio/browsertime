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
import net.browsertime.tool.timings.TimingMeasurement;
import net.browsertime.tool.timings.TimingRun;

import org.openqa.selenium.JavascriptExecutor;

import java.util.List;
import java.util.Map;

import static java.lang.Boolean.TRUE;

/**
 * Superclass for browser specific data collection, subclass as needed.
 */
public class TimingDataCollector {

    public void collectPageData(JavascriptExecutor js, Map<String, String> pageInfo) {
    }

    public void collectTimingData(JavascriptExecutor js, TimingRun results) {
    }

    /**
     * Execute a given javascript and check if the returned value is boolean true.
     *
     * @param executor the executor that should run the script.
     * @param script   the javascript that should be run, should include a return statement
     *                 that returns a boolean value.
     * @return <code>true</code> if the script evaluates to true, <code>false</code> if not.
     */
    boolean booleanFromJs(JavascriptExecutor executor, String script) {
        return TRUE.equals(executor.executeScript(script));
    }

    List listFromJs(JavascriptExecutor executor, String script) {
        return (List) executor.executeScript(script);
    }

    Long longFromJs(JavascriptExecutor executor, String script) {
        return (Long) executor.executeScript(script);
    }

    Double doubleFromJs(JavascriptExecutor executor, String script) {
        return (Double) executor.executeScript(script);
    }

    final static class MarkInterval {
        private final String measurementName;
        private final String startMarkName;
        private final String endMarkName;

        MarkInterval(String measurementName, String startMarkName, String endMarkName) {
            this.measurementName = measurementName;
            this.startMarkName = startMarkName;
            this.endMarkName = endMarkName;
        }

        void collectMeasurement(TimingRun timingRun) {
            TimingMark start = timingRun.getMark(startMarkName);
            TimingMark end = timingRun.getMark(endMarkName);

            if (start != null && end != null) {
                double duration = end.getStartTime() - start.getStartTime();
                TimingMeasurement m = new TimingMeasurement(measurementName, start.getStartTime(), duration);
                timingRun.addMeasurement(m);
            }
        }
    }
}
