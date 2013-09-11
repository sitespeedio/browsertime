package com.soulgalore.web.performance.navigation.run;

import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.ParseException;
import org.junit.Test;

public class WhenABrowserIsChoosen {

	@Test
	public void aNonValidBrowserShouldFail() {
		CliHelper helper = new CliHelper();
		String[] args = { "-b", "nonValidBrowser", "http://www.google.com" };
		try {
			CommandLine cl = helper.parse(args);
			helper.validateArgValues(cl);
			fail("A non valid browser name should throw an exception");
		} catch (ParseException e) {
		}
	}

	@Test
	public void firefoxShouldBeFirefox() {

		CliHelper helper = new CliHelper();
		String[] args = { "-b", "firefox", "http://www.google.com" };
		try {
			CommandLine cl = helper.parse(args);
			assertThat(CliHelper.FIREFOX, is(cl.getOptionValue("b")));

		} catch (ParseException e) {
			fail("firefox should signal a firefox browser");
		}

	}

	@Test
	public void chromeShouldBeChrome() {

		CliHelper helper = new CliHelper();
		String[] args = { "-b", "chrome", "http://www.google.com" };
		try {
			CommandLine cl = helper.parse(args);
			assertThat(CliHelper.CHROME, is(cl.getOptionValue("b")));

		} catch (ParseException e) {
			fail("chrome should signal a chrome browser");
		}

	}

	@Test
	public void ieShouldBeIe() {

		CliHelper helper = new CliHelper();
		String[] args = { "-b", "ie", "http://www.google.com" };
		try {
			CommandLine cl = helper.parse(args);
			assertThat(CliHelper.IE, is(cl.getOptionValue("b")));

		} catch (ParseException e) {
			fail("ie should signal a ie browser");
		}

	}

}
