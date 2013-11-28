package net.browsertime.tool.webdriver;

import com.google.inject.Provider;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

public class InternetExplorerDriverProvider implements Provider<WebDriver> {
    @Override
    public WebDriver get() {
        return new InternetExplorerDriver(getCapabilities());
    }

    public Capabilities getCapabilities() {
        DesiredCapabilities capabilities = new DesiredCapabilities();

        capabilities.setCapability(InternetExplorerDriver.IE_ENSURE_CLEAN_SESSION, true);

        return capabilities;
    }
}
