package com.soulgalore.web.performance.navigation.metrics;

import com.soulgalore.web.performance.navigation.TimingMetrics;

/**
 *
 */
class IntervalMetric extends NamedMetric
{
	private final String startPoint;
	private final String endPoint;

	protected IntervalMetric(String name, String startPoint, String endPoint)
	{
		super(name);
		this.startPoint = startPoint;
		this.endPoint = endPoint;
	}

	@Override
	public long calculateMetric(TimingMetrics timingMetrics)
	{
		return timingMetrics.getValue(endPoint) - timingMetrics.getValue(startPoint);
	}
}
