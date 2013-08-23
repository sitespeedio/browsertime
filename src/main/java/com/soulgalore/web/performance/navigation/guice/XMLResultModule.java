package com.soulgalore.web.performance.navigation.guice;

import com.google.inject.AbstractModule;
import com.soulgalore.web.performance.navigation.result.NavigationTimingResult;
import com.soulgalore.web.performance.navigation.result.NavigationTimingXMLResult;

/**
 *
 */
public class XMLResultModule extends AbstractModule
{
	@Override
	protected void configure()
	{
		bind(NavigationTimingResult.class).to(NavigationTimingXMLResult.class);
	}
}
