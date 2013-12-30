package net.browsertime.tool.webdriver;

import net.browsertime.tool.BrowserConfig;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.Map;

public class FirefoxDriverProvider extends WebDriverProvider {

    public FirefoxDriverProvider(Map<BrowserConfig, String> browserConfiguration) {
        super(browserConfiguration);
    }

    @Override
    public WebDriver get() {
        return new FirefoxDriver(createBinary(), createProfile(), createCapabilities());
    }

    private FirefoxBinary createBinary() {
        FirefoxBinary binary = new FirefoxBinary();
        String windowSize = browserConfiguration.get(BrowserConfig.windowSize);
        if (windowSize != null) {
            String[] parts = windowSize.split("x");
            binary.addCommandLineOptions("-width", parts[0], "-height", parts[1]);
        }

        return binary;
    }

    private FirefoxProfile createProfile() {
        FirefoxProfile profile = new FirefoxProfile();

        // http://kb.mozillazine.org/Firefox_:_FAQs_:_About:config_Entries
        profile.setPreference("browser.cache.disk.enable", false);
        profile.setPreference("browser.cache.memory.enable", false);
        profile.setPreference("browser.cache.offline.enable", false);
        profile.setPreference("network.http.use-cache", false);

        String userAgent = browserConfiguration.get(BrowserConfig.userAgent);
        if (userAgent != null) {
            profile.setPreference("general.useragent.override", userAgent);
        }

        return profile;
    }

    @Override
    protected DesiredCapabilities getBrowserCapabilities() {
        return DesiredCapabilities.firefox();
    }
}
