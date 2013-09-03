package com.soulgalore.web.performance.navigation.run;

import org.apache.commons.cli.ParseException;
import org.junit.Test;

public class FullTest {

	// Dummy test just to get travis up and running
		@Test
		public void whenFetchingAPageNoExceptionIsThrown() throws ParseException {
			FetchNavigationTiming.main(new String[]{"http://peterhedenskog.com"});
		}

}
