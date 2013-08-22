package com.soulgalore.web.performance.navigation.run;

import static org.junit.Assert.*;

import org.apache.commons.cli.ParseException;
import org.junit.Test;

public class FullTest {

	// Dummy test just to get travis up and running
		@Test
		public void whenFetchingAPageNoExceptionIsThrown() throws ParseException {
			FetchNavigationTiming.main(new String[]{"-u http://peterhedenskog.com"});
		}

}
