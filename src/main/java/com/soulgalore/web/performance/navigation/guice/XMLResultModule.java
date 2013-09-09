package com.soulgalore.web.performance.navigation.guice;

import com.google.inject.AbstractModule;
import com.google.inject.assistedinject.FactoryModuleBuilder;
import com.soulgalore.web.performance.navigation.serializer.Serializer;
import com.soulgalore.web.performance.navigation.serializer.SerializerFactory;
import com.soulgalore.web.performance.navigation.serializer.XmlSerializer;

/**
 *
 */
public class XMLResultModule extends AbstractModule
{
	@Override
	protected void configure()
	{
        install(new FactoryModuleBuilder()
                .implement(Serializer.class, XmlSerializer.class)
                .build(SerializerFactory.class));
    }
}
