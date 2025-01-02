import { Builder } from 'selenium-webdriver';
import { configureBuilder as configureBuilderChrome } from '../../chrome/webdriver/builder.js';
import { configureBuilder as configureBuilderEdge } from '../../edge/webdriver/builder.js';
import { configureBuilder as configureBuilderFirefox } from '../../firefox/webdriver/builder.js';
import { configureBuilder as configureBuilderSafari } from '../../safari/webdriver/builder.js';
import { isEmpty } from '../../support/util.js';

/**
 * Create a new WebDriver instance based on the specified options.
 * @param {Object} options the options for a web driver.
 * @returns {!Promise<webdriver.WebDriver>} a promise that resolves to the webdriver,
 * or rejects if the current configuration is invalid.
 */
export async function createWebDriver(baseDir, options) {
  const browser = options.browser || 'chrome';
  const seleniumUrl = options.selenium ? options.selenium.url : undefined;
  const capabilities = options.selenium
    ? options.selenium.capabilities
    : undefined;

  const builder = new Builder()
    .forBrowser(browser === 'edge' ? 'MicrosoftEdge' : browser)
    .usingServer(seleniumUrl);

  // Hack for running browsertime on different platforms.
  // Keep it in the dark for now becasue if you don't know
  // what you do, a lot can get wrong
  if (!isEmpty(capabilities)) {
    builder.withCapabilities(capabilities);
  }

  switch (browser) {
    case 'chrome': {
      await configureBuilderChrome(builder, baseDir, options);
      break;
    }

    case 'firefox': {
      await configureBuilderFirefox(builder, baseDir, options);
      break;
    }

    case 'safari': {
      await configureBuilderSafari(builder, baseDir, options);
      break;
    }

    case 'edge': {
      await configureBuilderEdge(builder, baseDir, options);
      break;
    }

    default: {
      throw new Error('Unsupported browser: ' + browser);
    }
  }

  return builder.build();
}
