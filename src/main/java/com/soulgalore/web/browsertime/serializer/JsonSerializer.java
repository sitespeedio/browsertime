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
package com.soulgalore.web.browsertime.serializer;

 import com.google.gson.Gson;
 import com.google.gson.GsonBuilder;
 import com.google.gson.TypeAdapter;
 import com.google.gson.stream.JsonReader;
 import com.google.gson.stream.JsonWriter;
 import com.google.inject.Inject;
 import com.google.inject.assistedinject.Assisted;
 import com.soulgalore.web.browsertime.timings.*;

 import java.io.IOException;
 import java.io.Writer;
 import java.text.DecimalFormat;
 import java.text.DecimalFormatSymbols;
 import java.util.List;

 /**
 *
 */
public class JsonSerializer implements Serializer {
     private static final DecimalFormat doubleFormat = new DecimalFormat("#.######", new DecimalFormatSymbols() {{
         setDecimalSeparator('.');
     }});

     private final Writer writer;

    @Inject
    public JsonSerializer(@Assisted Writer writer) {
        this.writer = writer;
    }

    @Override
    public void serialize(TimingSession session) throws IOException {
        GsonBuilder builder = new GsonBuilder();
        builder.registerTypeAdapter(Statistics.class, new StatisticsAdapter());
        builder.registerTypeAdapter(TimingRun.class, new TimingRunAdapter());
        Gson gson = builder.create();
        gson.toJson(session, writer);
        writer.close();
    }

    private static class StatisticsAdapter extends TypeAdapter<Statistics> {
        @Override
        public void write(JsonWriter out, Statistics value) throws IOException {
            List<Statistics.Statistic> statistics = value.getStatistics();
            out.beginArray();
            for (Statistics.Statistic statistic : statistics) {
                out.beginObject();
                out.name("name");
                out.value(statistic.name);
                out.name("min");
                out.value(doubleFormat.format(statistic.min));
                out.name("avg");
                out.value(doubleFormat.format(statistic.avg));
                out.name("median");
                out.value(doubleFormat.format(statistic.median));
                out.name("p60");
                out.value(doubleFormat.format(statistic.p60));
                out.name("p70");
                out.value(doubleFormat.format(statistic.p70));
                out.name("p80");
                out.value(doubleFormat.format(statistic.p80));
                out.name("p90");
                out.value(doubleFormat.format(statistic.p90));
                out.name("max");
                out.value(doubleFormat.format(statistic.max));
                out.endObject();
            }
            out.endArray();
        }

        @Override
        public Statistics read(JsonReader in) throws IOException {
            // Reading json is not used in Browsertime.
            return null;
        }
    }

    private static class TimingRunAdapter extends TypeAdapter<TimingRun> {

        @Override
        public void write(JsonWriter out, TimingRun run) throws IOException {
            out.beginObject();
            writeMarks(out, run);
            writeMeasurements(out, run);
            out.endObject();
        }

        private void writeMarks(JsonWriter out, TimingRun run) throws IOException {
            out.name("marks");
            out.beginArray();
            for (TimingMark mark : run.getMarks()) {
                out.beginObject();
                out.name("name");
                out.value(mark.getName());
                out.name("startTime");
                out.value(doubleFormat.format(mark.getStartTime()));
                out.endObject();
            }
            out.endArray();
        }

        private void writeMeasurements(JsonWriter out, TimingRun run) throws IOException {
            out.name("measurements");
            out.beginArray();
            for (TimingMeasurement measurement : run.getMeasurements()) {
                out.beginObject();
                out.name("name");
                out.value(measurement.getName());
                out.name("startTime");
                out.value(doubleFormat.format(measurement.getStartTime()));
                out.name("duration");
                out.value(doubleFormat.format(measurement.getDuration()));
                out.endObject();
            }
            out.endArray();
        }


        @Override
         public TimingRun read(JsonReader in) throws IOException {
             // Reading json is not used in Browsertime.
             return null;
         }
     }

 }
