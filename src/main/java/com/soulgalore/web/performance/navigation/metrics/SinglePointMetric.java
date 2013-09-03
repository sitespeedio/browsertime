package com.soulgalore.web.performance.navigation.metrics;

import com.soulgalore.web.performance.navigation.TimingMetrics;

/**
 *
 */
class SinglePointMetric extends NamedMetric
{
    private String property;

	protected SinglePointMetric(String name)
	{
		super(name);
        property = name;
	}

    SinglePointMetric(String name, String property) {
        super(name);
        this.property = property;
    }

    @Override
	public long calculateMetric(TimingMetrics timingMetrics)
	{
		return timingMetrics.getValue(property);
	}
}
