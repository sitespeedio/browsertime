package net.browsertime.tool.webdriver;

import com.google.inject.Provider;
import net.browsertime.tool.BrowserConfig;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import java.util.Map;

public class ChromeDriverProvider implements Provider<WebDriver> {
    private Map<BrowserConfig, String> browserConfiguration;

    public ChromeDriverProvider(Map<BrowserConfig, String> browserConfiguration) {
        this.browserConfiguration = browserConfiguration;
    }

    @Override
    public WebDriver get() {
        return new ChromeDriver(createChromeOptions());
    }

    private ChromeOptions createChromeOptions() {
        ChromeOptions options = new ChromeOptions();

        // see http://peter.sh/experiments/chromium-command-line-switches/
        String config = browserConfiguration.get(BrowserConfig.userAgent);
        if (config != null) {
            options.addArguments("--user-agent" + "=" + config);
        }

        config = browserConfiguration.get(BrowserConfig.windowSize);
        if (config != null) {
            config = config.replace("x", ",");
            options.addArguments("--window-size" + "=" + config);
        }

        options.addArguments("--window-position=0,0");

        return options;
    }
}
