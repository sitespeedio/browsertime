package com.soulgalore.web.performance.navigation.metrics;

import com.soulgalore.web.performance.navigation.TimingMetrics;

/**
 *
 */
public abstract class NamedMetric
{
	private final String name;

	protected NamedMetric(String name)
	{
		this.name = name;
	}


	public String getName()
	{
		return name;
	}

	public abstract long calculateMetric(TimingMetrics timingMetrics);
}
