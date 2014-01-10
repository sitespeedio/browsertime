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
  private enum ResourceTimingAttributes {
    name, entryType, startTime, duration, initiatorType, redirectStart, redirectEnd, fetchStart, domainLookupStart, domainLookupEnd, connectStart, connectEnd, secureConnectionStart, requestStart, responseStart, responseEnd
  }

  private static final String LIST_RESOURCES = buildResourceListingJavascript();

  @Override
  @SuppressWarnings("unchecked")
  public void collectTimingData(JavascriptExecutor js, TimingRun results) {
    if (!isPageDefinedTimingsSupported(js)) {
      return;
    }

    List<Map> resources = listFromJs(js, LIST_RESOURCES);

    if (resources != null && !resources.isEmpty()) {
      for (Map resource : resources) {
        MapAdapter ma = new MapAdapter(resource);
        String name = ma.asString(ResourceTimingAttributes.name.name());
        String initiatorType = ma.asString(ResourceTimingAttributes.initiatorType.name());
        double startTime = ma.asDouble(ResourceTimingAttributes.startTime.name());
        double duration = ma.asDouble(ResourceTimingAttributes.duration.name());
        double redirectStart = ma.asDouble(ResourceTimingAttributes.redirectStart.name());
        double redirectEnd = ma.asDouble(ResourceTimingAttributes.redirectEnd.name());
        double fetchStart = ma.asDouble(ResourceTimingAttributes.fetchStart.name());
        double domainLookupStart = ma.asDouble(ResourceTimingAttributes.domainLookupStart.name());
        double domainLookupEnd = ma.asDouble(ResourceTimingAttributes.domainLookupEnd.name());
        double connectStart = ma.asDouble(ResourceTimingAttributes.connectStart.name());
        double connectEnd = ma.asDouble(ResourceTimingAttributes.connectEnd.name());
        double secureConnectionStart =
            ma.asDouble(ResourceTimingAttributes.secureConnectionStart.name());
        double requestStart = ma.asDouble(ResourceTimingAttributes.requestStart.name());
        double responseStart = ma.asDouble(ResourceTimingAttributes.responseStart.name());
        double responseEnd = ma.asDouble(ResourceTimingAttributes.responseEnd.name());
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
   * A listing that explicitly selects attributes is needed since IE adds constructor as a property
   * of a PerformanceResourceTiming object.
   * 
   * @return A javascript that selects a list of objects, one object per resource.
   */
  private static String buildResourceListingJavascript() {
    StringBuilder builder = new StringBuilder();
    builder.append("var resources = [];").append('\n');
    builder.append("var entries = window.performance.getEntriesByType('resource');").append('\n');

    builder.append("for (var i = 0; i < entries.length; i++) {").append('\n');
    builder.append("var r = {};").append('\n');

    for (ResourceTimingAttributes ra : ResourceTimingAttributes.values()) {
      builder.append("r.").append(ra.name()).append(" = entries[i].").append(ra.name()).append(";")
          .append('\n');
    }

    builder.append("resources.push(r);").append('\n');

    builder.append("}").append('\n');

    builder.append("return resources;");
    return builder.toString();
  }

}
