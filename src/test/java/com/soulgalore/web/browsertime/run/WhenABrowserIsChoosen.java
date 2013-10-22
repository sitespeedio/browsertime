package com.soulgalore.web.browsertime.run;

import org.apache.commons.cli.ParseException;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

import static com.soulgalore.web.browsertime.run.Browser.*;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;

public class WhenABrowserIsChoosen {
    private CliParser parser;

    @Before
    public void setUp() throws Exception {
        parser = new CliParser();
    }

    @Test(expected = ParseException.class)
    public void invalidBrowserShouldFail() throws ParseException, IOException {
        String[] args = {"-b", "invalidBrowser", "http://www.google.com"};
        parser.parseArgs(args);
        parser.parseTimingConfig();
    }

    @Test
    public void firefoxShouldBeFirefox() throws IOException {
        testBrowserChoice(firefox);
    }

    @Test
    public void chromeShouldBeChrome() throws IOException {
        testBrowserChoice(chrome);
    }

    @Test
    public void ieShouldBeIe() throws IOException {
        testBrowserChoice(ie);
    }

    private void testBrowserChoice(Browser browser) throws IOException {
        String[] args = {"-b", browser.name(), "http://www.google.com"};
        try {
            parser.parseArgs(args);
            TimingConfig config = parser.parseTimingConfig();

            assertThat(browser, is(config.browser));

        } catch (ParseException e) {
            fail(browser + " should signal a " + browser + " browser");
        }
    }


}
