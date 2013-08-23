/******************************************************
 * Navigation timing
 * 
 *
 * Copyright (C) 2013 by Peter Hedenskog (http://peterhedenskog.com)
 *
 ******************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in 
 * compliance with the License. You may obtain a copy of the License at
 * 
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is 
 * distributed  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   
 * See the License for the specific language governing permissions and limitations under the License.
 *
 *******************************************************
 */
package com.soulgalore.web.performance.navigation.run;

import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.io.Writer;
import java.security.InvalidParameterException;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.cli.GnuParser;
import org.apache.commons.cli.ParseException;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;

import com.google.inject.Guice;
import com.google.inject.Injector;

import com.soulgalore.web.performance.navigation.NavigationTiming;
import com.soulgalore.web.performance.navigation.NavigationTimingCreator;

import com.soulgalore.web.performance.navigation.guice.ChromeJSONModule;
import com.soulgalore.web.performance.navigation.guice.ChromeXMLModule;
import com.soulgalore.web.performance.navigation.guice.FireFoxJSONModule;
import com.soulgalore.web.performance.navigation.guice.FireFoxXMLModule;
import com.soulgalore.web.performance.navigation.guice.InternetExplorerJSONModule;
import com.soulgalore.web.performance.navigation.guice.InternetExplorerXMLModule;
import com.soulgalore.web.performance.navigation.result.NavigationTimingResult;

public class FetchNavigationTiming {

	private static final String DNS_LOOKUP_TIME = "DNSLookupTime";
	private static final String REDIRECT_TIME = "RedirectTime";
	private static final String INITIAL_CONNECTION = "InitialConnection";
	private static final String TTFB = "TTFB";
	private static final String BASE_PAGE = "BasePage";
	private static final String DOM_PROCESSING = "DOMProcessing";
	private static final String RENDER_TIME = "RenderTime";
	private static final String DOM_INTERACTIVE = "DOMInteractive";
	private static final String DOM_COMPLETE = "DOMComplete";
	private static final String PAGE_LOAD = "PageLoad";
	private static final String FIRST_PAINT = "FirstPaint";
	private static final String BACKEND = "Backend";
	private static final String FRONTEND = "FrontEnd";
	
	private static final String ENCODING = "UTF-8";

	public static void main(String[] args) throws ParseException {

		FetchNavigationTiming fetchTimings = new FetchNavigationTiming();
		fetchTimings.fetch(args);

	}

	public void fetch(String[] args) throws ParseException {

		CliToConfiguration cli = new CliToConfiguration(new GnuParser());
		NavigationTimingConfiguration conf = cli.getConfiguration(args);

		if (!NavigationTimingConfiguration.VALID_BROWSERS.contains(conf
				.getBrowser())) {
			String error = "Invalid browser name:" + conf.getBrowser()
					+ " Valid browsers are:"
					+ NavigationTimingConfiguration.VALID_BROWSERS;
			throw new InvalidParameterException(error);
		}

		if (!NavigationTimingConfiguration.VALID_OUTPUT_FORMATS.contains(conf
				.getOuputFormat())) {

			String error = "Invalid output format name:"
					+ conf.getOuputFormat() + " Valid formats are:"
					+ NavigationTimingConfiguration.VALID_OUTPUT_FORMATS;
			throw new InvalidParameterException(error);
		}

		Map<String, DescriptiveStatistics> stats = getStatisticsMap();

		Injector injector = getInjector(conf);

		List<NavigationTiming> timings = new LinkedList<NavigationTiming>();

		for (int i = 0; i < conf.getRuns(); i++) {

			// Create a new creator for each run = new browser
			NavigationTimingCreator creator = injector
					.getInstance(NavigationTimingCreator.class);

			NavigationTiming timing = creator
					.get(conf.getURL(), "run:" + i + 1);

			addStats(timing, stats);
			timings.add(timing);
		}

		final NavigationTimingResult output = injector
				.getInstance(NavigationTimingResult.class);

		if ("".equals(conf.getFilename()))
			System.out.println(output.build(stats, timings, conf));
		else
			writeFile(conf.getFilename(), output.build(stats, timings, conf));
	}

	private Injector getInjector(NavigationTimingConfiguration conf) {

		// TODO this can be cleaner

		Injector injector;

		if (conf.getOuputFormat().toLowerCase()
				.equals(NavigationTimingConfiguration.OUTPUT_XML)) {

			if (conf.getBrowser().toLowerCase()
					.equals(NavigationTimingConfiguration.FIREFOX))
				injector = Guice.createInjector(new FireFoxXMLModule());
			else if (conf.getBrowser().toLowerCase()
					.equals(NavigationTimingConfiguration.INTERNET_EXPLORER))
				injector = Guice
						.createInjector(new InternetExplorerXMLModule());
			else
				injector = Guice.createInjector(new ChromeXMLModule());
		}

		else {
			if (conf.getBrowser().toLowerCase()
					.equals(NavigationTimingConfiguration.FIREFOX))
				injector = Guice.createInjector(new FireFoxJSONModule());
			else if (conf.getBrowser().toLowerCase()
					.equals(NavigationTimingConfiguration.INTERNET_EXPLORER))
				injector = Guice
						.createInjector(new InternetExplorerJSONModule());
			else
				injector = Guice.createInjector(new ChromeJSONModule());
		}
		return injector;
	}

	private void addStats(NavigationTiming timing,
			Map<String, DescriptiveStatistics> stats) {
		stats.get(DNS_LOOKUP_TIME).addValue(timing.getDNSLookupTime());
		stats.get(REDIRECT_TIME).addValue(timing.getRedirectTime());
		stats.get(INITIAL_CONNECTION).addValue(timing.getInitialConnection());
		stats.get(TTFB).addValue(timing.getTTFB());
		stats.get(BASE_PAGE).addValue(timing.getBasePage());
		stats.get(DOM_PROCESSING).addValue(timing.getDOMProcessing());
		stats.get(RENDER_TIME).addValue(timing.getRenderTime());
		stats.get(DOM_INTERACTIVE).addValue(timing.getDomInteractive());
		stats.get(DOM_COMPLETE).addValue(timing.getDomComplete());
		stats.get(PAGE_LOAD).addValue(
				timing.getPageLoad());
		stats.get(FIRST_PAINT).addValue(timing.getFirstPaint());
		stats.get(BACKEND).addValue(timing.getBackendTime());
		stats.get(FRONTEND).addValue(timing.getFrontEndTime());
	}

	private Map<String, DescriptiveStatistics> getStatisticsMap() {
		final Map<String, DescriptiveStatistics> stats = new HashMap<String, DescriptiveStatistics>();
		stats.put(DNS_LOOKUP_TIME, new DescriptiveStatistics());
		stats.put(REDIRECT_TIME, new DescriptiveStatistics());
		stats.put(INITIAL_CONNECTION, new DescriptiveStatistics());
		stats.put(TTFB, new DescriptiveStatistics());
		stats.put(BASE_PAGE, new DescriptiveStatistics());
		stats.put(DOM_PROCESSING, new DescriptiveStatistics());
		stats.put(RENDER_TIME, new DescriptiveStatistics());
		stats.put(DOM_INTERACTIVE, new DescriptiveStatistics());
		stats.put(DOM_COMPLETE, new DescriptiveStatistics());
		stats.put(PAGE_LOAD, new DescriptiveStatistics());
		stats.put(FIRST_PAINT, new DescriptiveStatistics());
		stats.put(BACKEND, new DescriptiveStatistics());
		stats.put(FRONTEND, new DescriptiveStatistics());
		return stats;
	}

	private void writeFile(String fileName, String output) {
		Writer out = null;
		try {
			out = new BufferedWriter(new OutputStreamWriter(
					new FileOutputStream(fileName), ENCODING));
			out.write(output);
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			System.err.println(e);
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			System.err.println(e);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			System.err.println(e);
		} finally {
			if (out != null)
				try {
					out.close();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					System.err.println(e);
				}
		}
	}
}
