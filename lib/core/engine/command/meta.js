/**
 * Add meta data to your user journey.
 *
 * @class
 * @hideconstructor
 */
export class Meta {
  constructor() {}

  /**
   * Sets the description for the user journey.
   * @example commands.meta.setDescription('My test');
   * @param {string} text - The text to set as the description.
   */
  setDescription(text) {
    this.description = text;
  }

  /**
   * Sets the title for the user journey.
   * @example commands.meta.setTitle('Test title');
   * @param {string} text - The text to set as the title.
   */
  setTitle(text) {
    this.title = text;
  }
}
