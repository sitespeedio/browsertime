package com.soulgalore.web.performance.navigation.serializer;

import com.soulgalore.web.performance.navigation.timings.TimingSession;

import java.io.IOException;

/**
 *
 */
public interface Serializer {
    void serialize(TimingSession session) throws IOException;
}
