import type { BrowsertimeContext, BrowsertimeCommands } from 'browsertime';

module.exports = async function (_context: BrowsertimeContext, commands: BrowsertimeCommands) {
    return commands.measure.start('https://www.sitespeed.io');
};
