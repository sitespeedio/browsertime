package com.soulgalore.web.performance.navigation.guice;

import com.google.inject.AbstractModule;
import com.soulgalore.web.performance.navigation.result.NavigationTimingJSONResult;
import com.soulgalore.web.performance.navigation.result.NavigationTimingResult;

/**
 *
 */
public class JSONResultModule extends AbstractModule
{
	@Override
	protected void configure()
	{
		bind(NavigationTimingResult.class).to(NavigationTimingJSONResult.class);
	}
}
