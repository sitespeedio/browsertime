import type { BrowsertimeContext, BrowsertimeCommands } from 'browsertime';

export default async function (_context: BrowsertimeContext, commands: BrowsertimeCommands) {
    return commands.measure.start('https://www.sitespeed.io');
}
