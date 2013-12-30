package net.browsertime.tool.webdriver;

import com.google.inject.Provider;
import net.browsertime.tool.BrowserConfig;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.Map;

public abstract class WebDriverProvider implements Provider<WebDriver> {
    protected Map<BrowserConfig, String> browserConfiguration;

    public WebDriverProvider(Map<BrowserConfig, String> browserConfiguration) {
        this.browserConfiguration = browserConfiguration;
    }

    protected DesiredCapabilities createCapabilities() {
        DesiredCapabilities c = getBrowserCapabilities();

        setProxyCapability(c);

        return c;
    }

    protected abstract DesiredCapabilities getBrowserCapabilities();

    private void setProxyCapability(DesiredCapabilities c) {
        String proxyUrl = browserConfiguration.get(BrowserConfig.proxyUrl);
        if (proxyUrl != null) {
            Proxy proxy = new Proxy();
            proxy.setHttpProxy(proxyUrl);
            c.setCapability(CapabilityType.PROXY, proxy);
        }
    }
}
