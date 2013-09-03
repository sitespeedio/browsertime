package com.soulgalore.web.performance.navigation;

import java.util.HashMap;
import java.util.Map;

/**
 *
 */
public class PageData {
    private Map<String, String> pageData = new HashMap<String, String>();

    public void addPageData(String name, String value) {
        pageData.put(name, value);
    }
}
