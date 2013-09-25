package com.soulgalore.web.browsertime.guice;

import java.util.Arrays;

import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.name.Named;
import com.soulgalore.web.browsertime.run.Main;

public class ChromeDriverProvider implements Provider<ChromeDriver> {

	private final ChromeOptions options;
	
	private static final String USER_AGENT_STRING = "--user-agent";
	private static final String WINDOW_SIZE_STRING = "--window-size";
	private static final String WINDOW_POSITION_STRING = "--window-position";
	
	@Inject
	public ChromeDriverProvider(@Named (ChromeModule.USER_AGENT) String userAgent, @Named (ChromeModule.WINDOW_SIZE) String windowSize) {
		options = new ChromeOptions();
		if (!"".equals(userAgent))
			options.addArguments(USER_AGENT_STRING + "=" + userAgent);
		if (!"".equals(windowSize))
			options.addArguments(WINDOW_SIZE_STRING + "=" + windowSize);
		options.addArguments(WINDOW_POSITION_STRING + "=" + "0,0");
	}
	
	
	@Override
	public ChromeDriver get() {
		return new ChromeDriver(options);
	}

}
