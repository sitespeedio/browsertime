package com.soulgalore.web.browsertime.run;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.ParseException;
import org.junit.Before;
import org.junit.Test;

import static com.soulgalore.web.browsertime.run.Browser.chrome;
import static com.soulgalore.web.browsertime.run.Browser.firefox;
import static com.soulgalore.web.browsertime.run.Browser.ie;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;

public class WhenABrowserIsChoosen {
    private CliHelper helper;

    @Before
    public void setUp() throws Exception {
        helper = new CliHelper();
    }

    @Test(expected = ParseException.class)
    public void invalidBrowserShouldFail() throws ParseException {
        String[] args = {"-b", "invalidBrowser", "http://www.google.com"};
        CommandLine cl = helper.parse(args);
        helper.validateArgValues(cl);
    }

    @Test
    public void firefoxShouldBeFirefox() {
        testBrowserChoice(firefox);
    }

    @Test
    public void chromeShouldBeChrome() {
        testBrowserChoice(chrome);
    }

    @Test
    public void ieShouldBeIe() {
        testBrowserChoice(ie);
    }

    private void testBrowserChoice(Browser browser) {
        String[] args = {"-b", browser.name(), "http://www.google.com"};
        try {
            CommandLine cl = helper.parse(args);
            assertThat(browser.name(), is(cl.getOptionValue("b")));

        } catch (ParseException e) {
            fail(browser + " should signal a " + browser + " browser");
        }
    }


}
