package com.soulgalore.web.performance.navigation.guice;

import com.google.inject.AbstractModule;
import com.google.inject.assistedinject.FactoryModuleBuilder;
import com.soulgalore.web.performance.navigation.serializer.JsonSerializer;
import com.soulgalore.web.performance.navigation.serializer.Serializer;
import com.soulgalore.web.performance.navigation.serializer.SerializerFactory;

/**
 *
 */
public class JSONResultModule extends AbstractModule
{
	@Override
	protected void configure()
	{
        install(new FactoryModuleBuilder()
                .implement(Serializer.class, JsonSerializer.class)
                .build(SerializerFactory.class));
    }
}
