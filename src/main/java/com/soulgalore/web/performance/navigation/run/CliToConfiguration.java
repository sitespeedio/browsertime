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
	private static final String OUTPUT = "output";
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
		b.setFilename(line.getOptionValue(OUTPUT, ""));
		b.setRuns(Integer.parseInt(line.getOptionValue(TIMES, "3")));
		b.setIncludeIndividualRuns(Boolean.valueOf(line.getOptionValue(INCLUDE, "false")));
		b.setOutputFormat(line.getOptionValue(FORMAT, "xml"));

		return b.build();

	}

	private Options setupOptions() {
		final Options options = new Options();

		addURLOption(options);
		addTimesOption(options);
		addBrowserOption(options);
		addOutputOption(options);
		addIncludeOption(options);
		addOutputFormat(options);

		return options;
	}

	private void addURLOption(Options options) {
		final Option o = createOption("u", URL, "The URL to test");
		o.setRequired(true);

		options.addOption(o);
	}

	private void addTimesOption(Options options) {
		final Option o = createOption("t", TIMES,
			"The number of times to run the test. Default is 3 times.");

		options.addOption(o);
	}

	private void addBrowserOption(Options options) {
		final Option o = createOption("b", BROWSER,
			"The browser to use ["
			+ NavigationTimingConfiguration.CHROME + "|"
			+ NavigationTimingConfiguration.FIREFOX + "|"
			+ NavigationTimingConfiguration.INTERNET_EXPLORER
			+ "]. Firefox is the default one.");

		options.addOption(o);
	}

	private void addOutputOption(Options options) {
		final Option o = createOption("o", OUTPUT,
			"Output the result as a file, give the name of the file. If no filename is given, the result is put on standard out.");

		options.addOption(o);
	}

	private void addIncludeOption(Options options) {
		final Option o = createOption("i", INCLUDE,
			"Include individual runs in the data output. [true|false]. Exclude is default.");

		options.addOption(o);
	}

	private void addOutputFormat(Options options) {
		final Option o = createOption("f", FORMAT,
			"Choose output format. [xml|json]. xml is default.");

		options.addOption(o);
	}

	/**
	 * Create an optional option with one argument.
	 */
	private Option createOption(String opt, String longName, String description)
	{
		final Option runOption = new Option(opt, description);
		runOption.setLongOpt(longName);
		runOption.setArgName(longName.toUpperCase());
		runOption.setRequired(false);
		runOption.setArgs(1);
		return runOption;
	}
}
