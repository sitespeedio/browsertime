/*******************************************************************************************************************************
 * It's Browser Time!
 * 
 * 
 * Copyright (C) 2013 by Tobias Lidskog (https://twitter.com/tobiaslidskog) & Peter Hedenskog
 * (http://peterhedenskog.com)
 * 
 ******************************************************************************************************************************** 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 * 
 ******************************************************************************************************************************** 
 */
package net.browsertime.tool.serializer;

import java.io.IOException;
import java.io.Writer;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;

import net.browsertime.tool.timings.TimingRunXmlAdapter;
import net.browsertime.tool.timings.TimingSession;

import com.google.inject.Inject;
import com.google.inject.name.Named;

/**
 *
 */
class XmlSerializer implements Serializer {
  private final boolean prettyPrint;
  private final boolean includeRuns;

  @Inject
  XmlSerializer(@Named("prettyPrint") boolean prettyPrint,
      @Named("includeRuns") boolean includeRuns) {
    this.prettyPrint = prettyPrint;
    this.includeRuns = includeRuns;
  }

  @Override
  public void serialize(TimingSession session, Writer writer) throws IOException {
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


}
