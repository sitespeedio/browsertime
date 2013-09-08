package com.soulgalore.web.performance.navigation;

import com.soulgalore.web.performance.navigation.timings.TimingSession;

import java.net.URL;

/**
 *
 */
public interface TimingRunner {

    TimingSession run(URL url, int numIterations);

}
