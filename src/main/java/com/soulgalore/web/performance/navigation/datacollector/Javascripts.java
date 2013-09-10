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