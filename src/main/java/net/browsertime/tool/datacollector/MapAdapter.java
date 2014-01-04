package net.browsertime.tool.datacollector;

import java.util.Map;

/**
 * Helper class to simplify reading time stamps from browsers. Since 0 is interpreted by Selenium as an integer,
 * it's represented as a Long. This class avoids ClassCastExceptions when reading all data as doubles.
 */
class MapAdapter {
    private final Map map;

    MapAdapter(Map map) {
        this.map = map;
    }

    String asString(String key) {
        return (String) map.get(key);
    }

    double asDouble(String key) {
        Object value = map.get(key);
        if (value != null) { // covers both missing key and explicit null (differs between ChromeDriver and IEDriver).
            return Double.parseDouble(value.toString());
        } else {
            return 0;
        }
    }
}
