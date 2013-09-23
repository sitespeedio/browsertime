 /*******************************************************************************************************************************
 * It's Browser Time!
 * 
 *
 * Copyright (C) 2013 by Tobias Lidskog (https://twitter.com/tobiaslidskog) &  Peter Hedenskog (http://peterhedenskog.com)
 *
 ********************************************************************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in 
 * compliance with the License. You may obtain a copy of the License at
 * 
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is 
 * distributed  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   
 * See the License for the specific language governing permissions and limitations under the License.
 *
 ********************************************************************************************************************************
 */
package com.soulgalore.web.browsertime.timings;

import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;

import javax.xml.bind.annotation.XmlElement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Statistics {
    // uses LinkedHashMap to be able to add statistics in a given order, and have that order preserved.
    private final Map<String, DescriptiveStatistics> statistics = new LinkedHashMap<String, DescriptiveStatistics>();

    public void add(String name, double value) {
        DescriptiveStatistics stats = getStatistics(name);
        stats.addValue(value);
    }

    private synchronized DescriptiveStatistics getStatistics(String name) {
     
    	DescriptiveStatistics stats = statistics.get(name);
        if (stats == null) {
            stats = new DescriptiveStatistics();
            statistics.put(name, stats);
        }
        return stats;
    }

    @XmlElement(name = "statistic")
    public List<Statistic> getStatistics() {
        List<Statistic> result = new ArrayList<Statistic>(statistics.size());

        for (Map.Entry<String, DescriptiveStatistics> entry : statistics.entrySet()) {
            result.add(Statistic.create(entry.getKey(), entry.getValue()));
        }
        
        return result;
    }

    public static class Statistic {
        @XmlElement String name;
        @XmlElement double min;
        @XmlElement double avg;
        @XmlElement double median;
        @XmlElement double p60;
        @XmlElement double p70;
        @XmlElement double p80;
        @XmlElement double p90;
        @XmlElement double max;

        public static Statistic create(String name, DescriptiveStatistics statistics) {
            Statistic statistic = new Statistic();
            statistic.name = name;
            statistic.min = statistics.getMin();
            statistic.avg = statistics.getMean();
            statistic.median = statistics.getPercentile(50);
            statistic.p60 = statistics.getPercentile(60);
            statistic.p70 = statistics.getPercentile(70);
            statistic.p80 = statistics.getPercentile(80);
            statistic.p90 = statistics.getPercentile(90);
            statistic.max = statistics.getMax();

            return statistic;
        }
    }

}
