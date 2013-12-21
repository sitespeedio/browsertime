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

import java.util.List;
import java.util.Map;

/**
 * Marks defined in the w3c timing recommendation.
 * http://www.w3.org/TR/navigation-timing/
 */
public class W3CTimingDataCollector extends TimingDataCollector {
    private static final String STANDARD_MARK_PREFIX = "window.performance.timing.";

    private static final String LIST_STANDARD_MARKS = "var properties = [];\n" +
            "for (var x in window.performance.timing) {\n" +
            "  properties.push(x);\n" +
            "}\n" +
            "return properties.sort();";

    @Override
    public void collectPageData(JavascriptExecutor js, Map<String, String> pageInfo) {
        if (!isNavigationApiSupported(js)) {
            return;
        }

        long redirectCount = (Long) js.executeScript("return window.performance.navigation.redirectCount;");
        pageInfo.put("redirectCount", Long.toString(redirectCount));
    }

    @Override
    @SuppressWarnings("unchecked")
    public void collectTimingData(JavascriptExecutor js, TimingRun results) {
        if (!isTimingApiSupported(js)) {
            return;
        }

        List<String> markNames = (List) js.executeScript(LIST_STANDARD_MARKS);

        for (String markName : markNames) {

            Object unknownType = js.executeScript("return "
                    + STANDARD_MARK_PREFIX + markName);

            // When Firefox 25 was released, the function toJSON was added to
            // window.performance.timing. so a String is returned, that's why
            // we now checks the type.
            if (unknownType instanceof Long) {
                double startTime = (Long) unknownType;
                if (startTime > 0) {
                    results.addMark(new TimingMark(markName, startTime));
                }
            }

        }
    }

    private boolean isNavigationApiSupported(JavascriptExecutor js) {
        return (Boolean) js
                .executeScript("return !!(window.performance && window.performance.navigation);");
    }

    private boolean isTimingApiSupported(JavascriptExecutor js) {
        return (Boolean) js
                .executeScript("return !!(window.performance && window.performance.timing);");
    }
}
