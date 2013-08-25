package com.soulgalore.web.performance.navigation.metrics;

import com.soulgalore.web.performance.navigation.TimingMetrics;

/**
 *
 */
class SinglePointMetric extends NamedMetric
{
	protected SinglePointMetric(String name)
	{
		super(name);
	}

	@Override
	public long calculateMetric(TimingMetrics timingMetrics)
	{
		return timingMetrics.getValue(getName());
	}
}
