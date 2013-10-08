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

import com.google.inject.Inject;
import com.google.inject.assistedinject.Assisted;
import com.soulgalore.web.browsertime.timings.TimingSession;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.IOException;
import java.io.Writer;

/**
 *
 */
public class XmlSerializer implements Serializer {
    private final Writer writer;
    private final boolean prettyPrint;

    @Inject
    public XmlSerializer(@Assisted Writer writer, @Assisted boolean prettyPrint) {
        this.writer = writer;
        this.prettyPrint = prettyPrint;
    }

    @Override
    public void serialize(TimingSession session) throws IOException {
        try {
            JAXBContext context = JAXBContext.newInstance(TimingSession.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, prettyPrint);
            marshaller.marshal(session, writer);
            writer.close();
        } catch (JAXBException e) {
            throw new RuntimeException(e);
        }
    }
}
