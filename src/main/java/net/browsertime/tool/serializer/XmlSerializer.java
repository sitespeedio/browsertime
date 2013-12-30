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

import com.google.inject.Inject;
import com.google.inject.assistedinject.Assisted;
import net.browsertime.tool.timings.TimingRun;
import net.browsertime.tool.timings.TimingSession;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.annotation.adapters.XmlAdapter;
import java.io.IOException;
import java.io.Writer;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;

 /**
 *
 */
public class XmlSerializer implements Serializer {
    private final Writer writer;
    private final boolean prettyPrint;
    private final boolean includeRuns;

    @Inject
    public XmlSerializer(@Assisted Writer writer,
                         @Assisted("prettyPrint") boolean prettyPrint,
                         @Assisted("includeRuns") boolean includeRuns) {
        this.writer = writer;
        this.prettyPrint = prettyPrint;
        this.includeRuns = includeRuns;
    }

    @Override
    public void serialize(TimingSession session) throws IOException {
        try {
            JAXBContext context = JAXBContext.newInstance(TimingSession.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setAdapter(TimingRunXmlAdapter.class, new TimingRunXmlAdapter(includeRuns));
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, prettyPrint);
            marshaller.marshal(session, writer);
            writer.close();
        } catch (JAXBException e) {
            throw new RuntimeException(e);
        }
    }

    public static class TimingRunXmlAdapter extends XmlAdapter<TimingRun, TimingRun> {
        private final boolean include;

        public TimingRunXmlAdapter(boolean include) {
            this.include = include;
        }

        @Override
        public TimingRun unmarshal(TimingRun v) throws Exception {
            if (include) {
                return v;
            }
            return null;
        }

        @Override
        public TimingRun marshal(TimingRun v) throws Exception {
            if (include) {
                return v;
            }
            return null;
        }
    }

    /**
     *
     */
    public static class NonScientificDoubleAdapter extends XmlAdapter<String, Double> {
        private final DecimalFormat format = new DecimalFormat("#.######", new DecimalFormatSymbols() {{
            setDecimalSeparator('.');
        }});

        @Override
        public Double unmarshal(String v) throws Exception {
            return Double.valueOf(v);
        }

        @Override
        public String marshal(Double v) throws Exception {
            return format.format(v);
        }
    }

     public static class OptionalNonScientificDoubleAdapter extends NonScientificDoubleAdapter {
         @Override
         public String marshal(Double v) throws Exception {
             return (v != null && v > 0) ? super.marshal(v) : null;
         }
     }
 }
