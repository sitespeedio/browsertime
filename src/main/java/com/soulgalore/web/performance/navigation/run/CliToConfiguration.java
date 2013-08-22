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

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.MissingOptionException;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;

import com.soulgalore.web.performance.navigation.run.NavigationTimingConfiguration.Builder;

public class CliToConfiguration {

	private static final String URL = "url";
	private static final String BROWSER = "browser";
	private static final String FILENAME = "filename";
	private static final String TIMES = "times";
	private static final String INCLUDE = "include";
	private static final String FORMAT = "format";

	private final CommandLineParser clp;

	public CliToConfiguration(CommandLineParser clp) {
		this.clp = clp;
	}

	public NavigationTimingConfiguration getConfiguration(String[] args)
			throws ParseException {
		CommandLine line;

		Options options = setupOptions();
		try {
			line = clp.parse(options, args);

		} catch (MissingOptionException moe) {

			final HelpFormatter hf = new HelpFormatter();
			hf.printHelp(this.getClass().getSimpleName(), options, true);
			throw moe;
		}

		Builder b = NavigationTimingConfiguration.builder();
		b.setURL(line.getOptionValue(URL));
		b.setBrowser(line.getOptionValue(BROWSER,
				NavigationTimingConfiguration.FIREFOX));
		b.setFilename(line.getOptionValue(FILENAME, ""));
		b.setRuns(Integer.parseInt(line.getOptionValue(TIMES, "3")));
		b.setIncludeIndividualRuns(new Boolean(line.getOptionValue(INCLUDE,"false")));
		b.setOutputFormat(line.getOptionValue(FORMAT, "xml"));
		NavigationTimingConfiguration conf = b.build();

		return conf;

	}

	private Options setupOptions() {
		final Options options = new Options();

		addURLOption(options);
		addTimesOption(options);
		addBrowserOption(options);
		addFileOption(options);
		addIncludeOption(options);
		addOutputFormat(options);

		return options;
	}

	private void addURLOption(Options options) {
		final Option urlOption = new Option("u", "The URL to test");
		urlOption.setLongOpt(URL);
		urlOption.setArgName(URL.toUpperCase());
		urlOption.setRequired(true);
		urlOption.setArgs(1);

		options.addOption(urlOption);
	}

	private void addTimesOption(Options options) {
		final Option runOption = new Option("t",
				"The number of times to run the test. Default is 3 times.");
		runOption.setLongOpt(TIMES);
		runOption.setArgName(TIMES.toUpperCase());
		runOption.setRequired(false);
		runOption.setArgs(1);

		options.addOption(runOption);
	}

	private void addBrowserOption(Options options) {
		final Option browserOption = new Option("b", "The browser to use ["
				+ NavigationTimingConfiguration.CHROME + "|"
				+ NavigationTimingConfiguration.FIREFOX + "|"
				+ NavigationTimingConfiguration.INTERNET_EXPLORER
				+ "]. Fierfox is the default one.");
		browserOption.setLongOpt(BROWSER);
		browserOption.setArgName(BROWSER.toUpperCase());
		browserOption.setRequired(false);
		browserOption.setArgs(1);
		options.addOption(browserOption);

	}

	private void addFileOption(Options options) {
		final Option fileOption = new Option(
				"f",
				"Output the result as a file, give the name of the file. If no filename is given, the result is put on standard out.");
		fileOption.setLongOpt(FILENAME);
		fileOption.setArgName(FILENAME.toUpperCase());
		fileOption.setRequired(false);
		fileOption.setArgs(1);

		options.addOption(fileOption);
	}

	private void addIncludeOption(Options options) {
		final Option includeIndividualOption = new Option(
				"i",
				"Include individual runs in the data output. [true|false]. Exclude is default.");
		includeIndividualOption.setLongOpt(INCLUDE);
		includeIndividualOption.setArgName(INCLUDE.toUpperCase());
		includeIndividualOption.setRequired(false);
		includeIndividualOption.setArgs(1);

		options.addOption(includeIndividualOption);
	}

	private void addOutputFormat(Options options) {

		final Option formatOption = new Option("f",
				"Choose output format. [xml|json]. xml is default.");
		formatOption.setLongOpt(FORMAT);
		formatOption.setArgName(FORMAT.toUpperCase());
		formatOption.setRequired(false);
		formatOption.setArgs(1);

		options.addOption(formatOption);
	}
}
