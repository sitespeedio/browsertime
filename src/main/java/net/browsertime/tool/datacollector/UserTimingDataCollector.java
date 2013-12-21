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

/**
 * Marks and measurements defined in the w3c user timing recommendation.
 * http://www.w3.org/TR/user-timing/
 * <p/>
 * NOTE: The user timing spec uses a different resolution for time stamps (milliseconds with a decimal part)
 */
public class UserTimingDataCollector extends TimingDataCollector {
    private static final String LIST_PAGE_DEFINED_MARKS =
            "return window.performance.getEntriesByType('mark');";

    private static final String LIST_PAGE_DEFINED_MEASUREMENTS =
            "return window.performance.getEntriesByType('measure');";

    private boolean shouldAddMeasurementsForUserMarks;

    public UserTimingDataCollector(boolean shouldAddMeasurementsForUserMarks) {
        this.shouldAddMeasurementsForUserMarks = shouldAddMeasurementsForUserMarks;
    }

    @Override
    public void collectTimingData(JavascriptExecutor js, TimingRun results) {
        collectMarks(js, results);
        collectMeasurements(js, results);
    }

    @SuppressWarnings("unchecked")
    private void collectMarks(JavascriptExecutor js, TimingRun results) {
        if (!isUserTimingApiSupported(js)) {
            return;
        }

        List marks = (List) js.executeScript(LIST_PAGE_DEFINED_MARKS);

        if (marks != null) {
            for (Object m : marks) {
                Map mark = (Map) m;
                String name = (String) mark.get("name");
                double startTime = (Double) mark.get("startTime");
                results.addMark(new TimingMark(name, startTime));
            }
        }
    }

    private void collectMeasurements(JavascriptExecutor js, TimingRun results) {
        if (!isUserTimingApiSupported(js)) {
            return;
        }

        if (shouldAddMeasurementsForUserMarks) {
            // create synthetic measurements for each mark, in order to easily get both start time and duration.
            List marks = (List) js.executeScript(LIST_PAGE_DEFINED_MARKS);

            if (marks != null) {
                for (Object m : marks) {
                    Map mark = (Map) m;
                    String name = (String) mark.get("name");
                    double startTime = (Double) mark.get("startTime");
                    results.addMeasurement(new TimingMeasurement(name, 0, startTime));
                }
            }
        }

        List measurements = (List) js.executeScript(LIST_PAGE_DEFINED_MEASUREMENTS);

        if (measurements != null) {
            for (Object m : measurements) {
                Map measurement = (Map) m;
                String name = (String) measurement.get("name");
                double startTime = (Double) measurement.get("startTime");
                double duration = (Double) measurement.get("duration");
                results.addMeasurement(new TimingMeasurement(name, startTime, duration));
            }
        }
    }

    private boolean isUserTimingApiSupported(JavascriptExecutor js) {
        return (Boolean) js
                .executeScript("return !!(window.performance && window.performance.getEntriesByType);");
    }
}
