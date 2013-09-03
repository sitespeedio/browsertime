package com.soulgalore.web.performance.navigation;

import com.soulgalore.web.performance.navigation.timings.Timing;

import java.net.URL;
import java.util.List;

/**
 *
 */
public interface TimingRunner {

    List<Timing> run(URL url, int numIterations);

}
