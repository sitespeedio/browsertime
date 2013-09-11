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
package com.soulgalore.web.performance.navigation.datacollector;

import com.soulgalore.web.performance.navigation.timings.TimingRun;
import com.soulgalore.web.performance.navigation.timings.TimingMark;
import org.openqa.selenium.JavascriptExecutor;

import java.util.List;
import java.util.Map;

import static com.soulgalore.web.performance.navigation.datacollector.Javascripts.LIST_STANDARD_MARKS;
import static com.soulgalore.web.performance.navigation.datacollector.Javascripts.STANDARD_MARK_PREFIX;

/**
 * Marks and measurements defined in the w3c timing recommendation.
 */
public class W3CTimingDataCollector extends TimingDataCollector {
    @Override
    public void collectPageData(JavascriptExecutor js, Map<String, String> pageInfo) {
        long redirectCount = (Long) js.executeScript("return window.performance.navigation.redirectCount;");
        pageInfo.put("redirectCount", Long.toString(redirectCount));
    }

    @Override
    @SuppressWarnings("unchecked")
    public void collectMarks(JavascriptExecutor js, TimingRun results) {
        if (!isNavigationTimingSupported(js)) {
            return;
        }

        List<String> markNames = (List) js.executeScript(LIST_STANDARD_MARKS);

        for (String markName : markNames) {
            long startTime = (Long) js.executeScript("return " + STANDARD_MARK_PREFIX + markName);
            if (startTime > 0) {
                results.addMark(new TimingMark(markName, startTime));
            }
        }
    }

    private boolean isNavigationTimingSupported(JavascriptExecutor js) {
        return (Boolean) js
                .executeScript("return !!(window.performance && window.performance.timing);");
    }
}
