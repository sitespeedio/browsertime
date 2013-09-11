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

class Javascripts {

    public static final String LIST_STANDARD_MARKS = "var properties = [];\n" +
            "for (var x in window.performance.timing) {\n" +
            "  properties.push(x);\n" +
            "}\n" +
            "return properties.sort();";

    public static final String STANDARD_MARK_PREFIX = "window.performance.timing.";

    public static final String LIST_PAGE_DEFINED_MARKS = "return window.performance.getEntriesByType('mark');";

    public static final String LIST_PAGE_DEFINED_MEASUREMENTS = "return window.performance.getEntriesByType('measure');";

    // private to avoid instantiation
    private Javascripts() {
    }
}