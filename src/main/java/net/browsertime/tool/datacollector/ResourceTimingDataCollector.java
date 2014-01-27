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

import net.browsertime.tool.timings.TimingResourceMeasurement;
import net.browsertime.tool.timings.TimingRun;
import org.openqa.selenium.JavascriptExecutor;

import java.util.List;
import java.util.Map;

/**
 * Marks defined in the w3c resource timing recommendation. http://www.w3.org/TR/resource-timing/
 * <p/>
 * NOTE: The user timing spec uses a different resolution for time stamps (milliseconds with a
 * decimal part)
 */
public class ResourceTimingDataCollector extends TimingDataCollector {
  private static final String LIST_RESOURCES =
      "return window.performance.getEntriesByType('resource');";

  @Override
  @SuppressWarnings("unchecked")
  public void collectTimingData(JavascriptExecutor js, TimingRun results) {
    if (!isPageDefinedTimingsSupported(js)) {
      return;
    }

    List<Map> resources = listFromJs(js, LIST_RESOURCES);

    if (resources != null && !resources.isEmpty()) {
      for (Map resource : resources) {
        DoubleAdapter da = new DoubleAdapter(resource);
        String name = (String) resource.get("name");
        String initiatorType = (String) resource.get("initiatorType");
        double startTime = da.asDouble("startTime");
        double duration = da.asDouble("duration");
        double redirectStart = da.asDouble("redirectStart");
        double redirectEnd = da.asDouble("redirectEnd");
        double fetchStart = da.asDouble("fetchStart");
        double domainLookupStart = da.asDouble("domainLookupStart");
        double domainLookupEnd = da.asDouble("domainLookupEnd");
        double connectStart = da.asDouble("connectStart");
        double connectEnd = da.asDouble("connectEnd");
        double secureConnectionStart = da.asDouble("secureConnectionStart");
        double requestStart = da.asDouble("requestStart");
        double responseStart = da.asDouble("responseStart");
        double responseEnd = da.asDouble("responseEnd");
        results.addResourceMeasurement(new TimingResourceMeasurement(name, startTime,
            initiatorType, duration, redirectStart, redirectEnd, fetchStart, domainLookupStart,
            domainLookupEnd, connectStart, connectEnd, secureConnectionStart, requestStart,
            responseStart, responseEnd));
      }
    }
  }

  private boolean isPageDefinedTimingsSupported(JavascriptExecutor js) {
    return booleanFromJs(js,
        "return !!(window.performance && window.performance.getEntriesByType);");
  }

  /**
   * Helper class to simplify reading time stamps from browsers. Since 0 is interpreted by Selenium
   * as an integer, it's represented as a Long. This class avoids ClassCastExceptions when reading
   * all data as doubles.
   */
  private static class DoubleAdapter {
    private final Map map;

    DoubleAdapter(Map map) {
      this.map = map;
    }

    double asDouble(String key) {
      return Double.parseDouble(map.get(key).toString());
    }
  }
}
