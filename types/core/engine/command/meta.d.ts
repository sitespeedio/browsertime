/**
 * Add meta data to your user journey.
 *
 * @class
 * @hideconstructor
 */
export class Meta {
    /**
     * Sets the description for the user journey.
     * @example commands.meta.setDescription('My test');
     * @param {string} text - The text to set as the description.
     */
    setDescription(text: string): void;
    description: string;
    /**
     * Sets the title for the user journey.
     * @example commands.meta.setTitle('Test title');
     * @param {string} text - The text to set as the title.
     */
    setTitle(text: string): void;
    title: string;
}
//# sourceMappingURL=meta.d.ts.map