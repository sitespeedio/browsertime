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
package net.browsertime.tool.serializer;

 import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;
import com.google.inject.Inject;
import com.google.inject.assistedinject.Assisted;
import net.browsertime.tool.timings.*;

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
    private final boolean prettyPrint;
    private final boolean includeRuns;

    @Inject
    public JsonSerializer(@Assisted Writer writer,
                          @Assisted("prettyPrint") boolean prettyPrint,
                          @Assisted("includeRuns") boolean includeRuns) {
        this.writer = writer;
        this.prettyPrint = prettyPrint;
        this.includeRuns = includeRuns;
    }

    @Override
    public void serialize(TimingSession session) throws IOException {
        GsonBuilder builder = new GsonBuilder();
        builder.registerTypeAdapter(Statistics.class, new StatisticsAdapter());
        builder.registerTypeAdapter(TimingRun.class, new TimingRunAdapter(includeRuns));
        if (prettyPrint) {
            builder.setPrettyPrinting();
        }
        Gson gson = builder.create();
        gson.toJson(session, writer);
        writer.close();
    }

     private static void print(JsonWriter out, String name, String value) throws IOException {
         out.name(name);
         out.value(value);
     }

     private static void print(JsonWriter out, String name, double value) throws IOException {
         out.name(name);
         out.value(doubleFormat.format(value));
     }

     private static class StatisticsAdapter extends TypeAdapter<Statistics> {
        @Override
        public void write(JsonWriter out, Statistics value) throws IOException {
            List<Statistics.Statistic> statistics = value.getStatistics();
            out.beginArray();
            for (Statistics.Statistic statistic : statistics) {
                out.beginObject();
                print(out, "name", statistic.name);
                print(out, "min", statistic.min);
                print(out, "avg", statistic.avg);
                print(out, "median", statistic.median);
                print(out, "p60", statistic.p60);
                print(out, "p70", statistic.p70);
                print(out, "p80", statistic.p80);
                print(out, "p90", statistic.p90);
                print(out, "max", statistic.max);
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

        private final boolean shouldSerialize;

        public TimingRunAdapter(boolean shouldSerialize) {
            this.shouldSerialize = shouldSerialize;
        }

        @Override
        public void write(JsonWriter out, TimingRun run) throws IOException {
            if (!shouldSerialize) {
                return;
            }
            out.beginObject();
            writeMarks(out, run);
            writeMeasurements(out, run);
            writeResourceMeasurements(out, run);
            out.endObject();
        }

        private void writeMarks(JsonWriter out, TimingRun run) throws IOException {
            out.name("marks");
            out.beginArray();
            for (TimingMark mark : run.getMarks()) {
                out.beginObject();
                print(out, "name", mark.getName());
                print(out, "startTime", mark.getStartTime());
                out.endObject();
            }
            out.endArray();
        }

        private void writeMeasurements(JsonWriter out, TimingRun run) throws IOException {
            out.name("measurements");
            out.beginArray();
            for (TimingMeasurement measurement : run.getMeasurements()) {
                out.beginObject();
                print(out, "name", measurement.getName());
                print(out, "startTime", measurement.getStartTime());
                print(out, "duration", measurement.getDuration());
                out.endObject();
            }
            out.endArray();
        }

        private void writeResourceMeasurements(JsonWriter out, TimingRun run) throws IOException {
            out.name("resourceMeasurements");
            out.beginArray();
            for (TimingResourceMeasurement measurement : run.getResourceMeasurements()) {
                out.beginObject();
                print(out, "name", measurement.getName());
                print(out, "startTime", measurement.getStartTime());
                print(out, "duration", measurement.getDuration());
                print(out, "initiatorType", measurement.getInitiatorType());
                print(out, "redirectStart", measurement.getRedirectStart());
                print(out, "redirectEnd", measurement.getRedirectEnd());
                print(out, "fetchStart", measurement.getFetchStart());
                print(out, "domainLookupStart", measurement.getDomainLookupStart());
                print(out, "domainLookupEnd", measurement.getDomainLookupEnd());
                print(out, "connectStart", measurement.getConnectStart());
                print(out, "connectEnd", measurement.getConnectEnd());
                print(out, "secureConnectionStart", measurement.getSecureConnectionStart());
                print(out, "requestStart", measurement.getRequestStart());
                print(out, "responseStart", measurement.getResponseStart());
                print(out, "responseEnd", measurement.getResponseEnd());
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
