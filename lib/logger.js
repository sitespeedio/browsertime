var winston = require('winston'),
    path = require('path');

var DEFAULT_LOG = 'browsertime';

module.exports = {
  getLog: function(name) {
    name = name || DEFAULT_LOG;

    return winston.loggers.get(name);
  },

  addLog: function(name, options) {
    name = name || DEFAULT_LOG;
    options = options || {};

    if (winston.loggers.has(name)) {
      throw new Error('Logger with name ' + name + ' already exists!');
    }

    var logPath = path.join(options.logDir || '', name + '.log');

    var winstonOpts = {
      file: {
        level: 'info',
        json: false,
        label: name,
        filename: logPath
      },
      console: {
        colorize: !options.noColor,
        silent: !!options.silent
      }
    };

    return winston.loggers.add(name, winstonOpts);
  }
};