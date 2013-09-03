package com.soulgalore.web.performance.navigation.metrics;

import java.util.List;

/**
 *
 */
public interface Metrics
{
    /*
        TODO: split timing metrics (to perform statistics on) from single value metrics (e.g. spdy?)
        TODO: perhaps check metadata (browser version etc) together with single value metrics (need better name)
        on first launch of browser.
        TODO: include ability to specify how metrics is captured from browser (possibly in another interface)
     */

    List<NamedMetric> getAllMetrics();
}
