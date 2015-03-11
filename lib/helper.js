/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

'use strict';

var fs = require('fs'),
  path = require('path');

module.exports = {

	parseWindowSize: function(size, log) {
		if (!size) {
			return undefined;
		}

		var coordinates = size.split('x');
		var parsedSize;

		if (coordinates.length === 2) {
			parsedSize = {
				'x': parseInt(coordinates[0], 10),
				'y': parseInt(coordinates[1], 10)
			};
		}

		if (!parsedSize || isNaN(parsedSize.x) || isNaN(parsedSize.y)) {
			log.warn('%s is not a valid windows size. It needs to be formatted as WIDTHxHEIGHT, e.g. 640x480.', size);
		}

		return parsedSize;
	},
	readScripts: function(folder, result, log) {

    var self = this;
		folder.forEach(function(rootPath) {
			fs.readdirSync(rootPath).forEach(function(file) {
				var name = self.cleanScriptName(path.basename(file, '.js'));

				if (result[name]) {
					log.error('Colliding script name:' + file + ' - will skip running the script.');
				} else {
					result[name] = '' + fs.readFileSync(path.join(rootPath, file));
				}

			});
		});

	},

	cleanScriptName: function(name) {
		// remove . and spaces
		return name.replace(/[\. ,:-]+/g, '');
	},

	isNumber: function(input) {
		return (input - 0) === input && ('' + input).trim().length > 0;
	}
};
