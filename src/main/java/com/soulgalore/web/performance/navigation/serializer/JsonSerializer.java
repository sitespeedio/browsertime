package com.soulgalore.web.performance.navigation.serializer;

import com.google.gson.Gson;
import com.google.inject.Inject;
import com.google.inject.assistedinject.Assisted;
import com.soulgalore.web.performance.navigation.timings.TimingSession;

import java.io.IOException;
import java.io.Writer;

/**
 *
 */
public class JsonSerializer implements Serializer {
    private final Writer writer;

    @Inject
    public JsonSerializer(@Assisted Writer writer) {
        this.writer = writer;
    }

    @Override
    public void serialize(TimingSession session) throws IOException {
        Gson gson = new Gson();
        gson.toJson(session, writer);
        writer.close();
    }
}
