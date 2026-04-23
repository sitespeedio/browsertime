import { By } from 'selenium-webdriver';

/**
 * Parses a selector string into a Selenium By locator.
 * Supports prefix-based strategies:
 * - 'id:value' -> By.id('value')
 * - 'xpath:expression' -> By.xpath('expression')
 * - 'name:value' -> By.name('value')
 * - 'text:value' -> By.xpath('//*[normalize-space(text())="value"]')
 * - 'link:value' -> By.xpath('//a[text()="value"]')
 * - 'class:value' -> By.className('value')
 * - No prefix -> By.css(selector) (CSS selector is the default)
 *
 * @param {string} selector - The selector string to parse.
 * @returns {{ locator: By, description: string }} The parsed locator and a human-readable description.
 */
export function parseSelector(selector) {
  const colonIndex = selector.indexOf(':');
  if (colonIndex > 0) {
    const prefix = selector.slice(0, colonIndex).toLowerCase();
    const value = selector.slice(colonIndex + 1);
    switch (prefix) {
      case 'id': {
        return { locator: By.id(value), description: `id ${value}` };
      }
      case 'xpath': {
        return { locator: By.xpath(value), description: `xpath ${value}` };
      }
      case 'name': {
        return { locator: By.name(value), description: `name ${value}` };
      }
      case 'text': {
        return {
          locator: By.xpath(`//*[normalize-space(text())='${value}']`),
          description: `text ${value}`
        };
      }
      case 'link': {
        return {
          locator: By.xpath(`//a[text()='${value}']`),
          description: `link text ${value}`
        };
      }
      case 'class': {
        return {
          locator: By.className(value),
          description: `class ${value}`
        };
      }
      default: {
        // Unknown prefix — treat entire string as CSS selector
        return { locator: By.css(selector), description: `css ${selector}` };
      }
    }
  }
  // No prefix — CSS selector
  return { locator: By.css(selector), description: `css ${selector}` };
}
