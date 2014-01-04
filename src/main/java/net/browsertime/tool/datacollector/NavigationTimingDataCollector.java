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
 * Marks defined in the w3c navigation timing recommendation.
 * http://www.w3.org/TR/navigation-timing/
 */
public class NavigationTimingDataCollector extends TimingDataCollector {
    private enum NavigationAttributes {
        navigationStart,
        unloadEventStart,
        unloadEventEnd,
        redirectStart,
        redirectEnd,
        fetchStart,
        domainLookupStart,
        domainLookupEnd,
        connectStart,
        connectEnd,
        secureConnectionStart,
        requestStart,
        responseStart,
        responseEnd,
        domLoading,
        domInteractive,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        domComplete,
        loadEventStart,
        loadEventEnd
    }

    private static final String STANDARD_MARK_PREFIX = "window.performance.timing.";

    private static final String LIST_STANDARD_MARKS = buildMarksListingJavascript();

    @Override
    public void collectPageData(JavascriptExecutor js, Map<String, String> pageInfo) {
        if (!isNavigationApiSupported(js)) {
            return;
        }

        long redirectCount = longFromJs(js, "return window.performance.navigation.redirectCount;");
        pageInfo.put("redirectCount", Long.toString(redirectCount));
    }

    @Override
    @SuppressWarnings("unchecked")
    public void collectTimingData(JavascriptExecutor js, TimingRun results) {
        if (!isTimingApiSupported(js)) {
            return;
        }

        List<Map> marks = listFromJs(js, LIST_STANDARD_MARKS);

        if (marks != null) {
            for (Map mark : marks) {
                MapAdapter ma = new MapAdapter(mark);
                String name = ma.asString("name");
                double time = ma.asDouble ("time");
                results.addMark(new TimingMark(name, time));
            }
        }
    }

    private boolean isNavigationApiSupported(JavascriptExecutor js) {
        return booleanFromJs(js, "return !!(window.performance && window.performance.navigation);");
    }

    private boolean isTimingApiSupported(JavascriptExecutor js) {
        return booleanFromJs(js, "return !!(window.performance && window.performance.timing);");
    }

    /**
     * A listing that explicitly selects attributes is needed since Firefox 25 adds toJSON as a
     * property of window.performance.timing, instead of on the __proto__.
     * @return A javascript that selects a list of objects, one object per navigation mark.
     */
    private static String buildMarksListingJavascript() {
        StringBuilder builder = new StringBuilder();
        builder.append("var marks = [];").append('\n');
        for (NavigationAttributes na : NavigationAttributes.values()) {
            builder.append("var m = {};").append('\n');
            builder.append("m.name='").append(na.name()).append("';").append('\n');
            builder.append("m.time=").append(STANDARD_MARK_PREFIX).append(na.name()).append(';').append('\n');
            builder.append("if (typeof m.time !== 'undefined')").append('\n');
            builder.append("   ").append("marks.push(m);").append('\n');
        }
        builder.append("return marks;");
        return builder.toString();
    }
}
