package net.browsertime.tool.run;

import org.apache.commons.cli.ParseException;
import org.junit.Test;

public class FetchAndTimeIT {

  // Dummy test just to get travis up and running
  @Test
  public void whenFetchingAPageNoExceptionIsThrown() throws ParseException {
    Main app = new Main();
    int status = app.handleCommandLine(new String[] {"http://peterhedenskog.com"});
    assert status == Main.OK;
  }

}
