package com.soulgalore.web.performance.navigation.serializer;

import com.google.inject.Inject;
import com.google.inject.assistedinject.Assisted;
import com.soulgalore.web.performance.navigation.timings.TimingSession;

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

    @Inject
    public XmlSerializer(@Assisted Writer writer) {
        this.writer = writer;
    }

    @Override
    public void serialize(TimingSession session) throws IOException {
        try {
            JAXBContext context = JAXBContext.newInstance(TimingSession.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
            marshaller.marshal(session, writer);
            writer.close();
        } catch (JAXBException e) {
            throw new RuntimeException(e);
        }
    }
}
