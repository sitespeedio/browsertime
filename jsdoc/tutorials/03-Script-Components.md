
### Context Object

The `context` object in your script gives you access to:

- `options`: All options sent from the CLI to Browsertime.
- `log`: An instance of the log system.
- `index`: The index of the current run.
- `storageManager`: Helps in reading/storing files to disk.
- `selenium.webdriver`: The public API object of Selenium WebDriver.
- `selenium.driver`: The instantiated WebDriver for the current browser session.

### Commands Object

Commands are helpers for interacting with webpages. Key commands include:

- `navigate(URL)`: Navigates to a URL without automatic measurement.
- `measure.start(URL)`: Starts measuring and navigates to a URL.
- `measure.stop()`: Stops the measurement and collects metrics.