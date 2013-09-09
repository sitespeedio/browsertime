package com.soulgalore.web.performance.navigation.serializer;

import java.io.Writer;

/**
 *
 */
public interface SerializerFactory {
    public Serializer create(Writer writer);
}
