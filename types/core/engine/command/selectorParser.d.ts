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
export function parseSelector(selector: string): {
    locator: By;
    description: string;
};
import { By } from 'selenium-webdriver';
//# sourceMappingURL=selectorParser.d.ts.map