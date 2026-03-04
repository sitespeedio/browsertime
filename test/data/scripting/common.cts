interface BrowsertimeCommands {
    measure: {
        start: (url: string) => Promise<void>;
    };
}

type BrowsertimeContext = unknown;

module.exports = async function (_context: BrowsertimeContext, commands: BrowsertimeCommands) {
    return commands.measure.start('https://www.sitespeed.io');
};
