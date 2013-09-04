package com.soulgalore.web.performance.navigation.datacollector;

class Javascripts {

    // http://calendar.perfplanet.com/2012/an-introduction-to-the-resource-timing-api/


    public static final String LIST_STANDARD_MARKS = "var properties = [];\n" +
            "for (var x in window.performance.timing) {\n" +
            "  properties.push(x);\n" +
            "}\n" +
            "return properties.sort();";

    public static final String STANDARD_MARK_PREFIX = "window.performance.timing.";

    //    public static final String LIST_PAGE_DEFINED_MARKS = "var properties = [];\n" +
//            "for (var mark in window.performance.getEntriesByType('mark')) {\n" +
//            "  properties.push([mark.name, mark.startTime]);\n" +
//            "}\n" +
//            "return properties;";

    public static final String LIST_PAGE_DEFINED_MARKS = "return window.performance.getEntriesByType('mark');";
//            " console.log(marks); " +
//            "var properties = '';\n" +
//            "for (var mark in marks) {\n" +
//            "  properties = properties + mark.name + ' ' + mark.startTime;\n" +
//            "}\n" +
//            "return properties;";

//    public static final String GET_PAGE_DEFINED_MARK = "return ";

    public static final String LIST_PAGE_DEFINED_MEASUREMENTS = "return window.performance.getEntriesByType('measure');";

/*
    public static final String LIST_PAGE_DEFINED_MEASUREMENTS = "var properties = [];\n" +
            "for (var mark in window.performance.getEntriesByType('measure')) {\n" +
            "  properties.push([mark.name, mark.startTime, mark.duration]);\n" +
            "}\n" +
            "return properties;";
*/

    // private to avoid instantiation
    private Javascripts() {
    }
}