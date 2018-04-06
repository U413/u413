'use strict';

const
	winston = require("winston");

const level = process.env.LOG ||
	(process.env.DEBUG? "debug" : "info");

const logger = new winston.Logger({
	level,
	transports: [
		new winston.transports.File({
			name: "error",
			filename: "private/error.log",
			level: "error"
		}),
		new winston.transports.File({
			name: "u413",
			filename: "private/u413.log"
		}),
		new winston.transports.Console({
			// Undefined? It's documented...
			//format: winston.format.simple()
			prettyPrint: true,
			colorize: true
		})
	]
});

logger.log('info', "Using logging level", level);

module.exports = {
	level,
	error(...args) {
		logger.log('error', ...args);
	},
	warn(...args) {
		logger.log("warn", ...args);
	},
	info(...args) {
		logger.log('info', ...args);
	},
	verbose(...args) {
		logger.log('verbose', ...args);
	},
	debug(...args) {
		logger.log('debug', ...args);
	},
	silly(...args) {
		logger.log('silly', ...args);
	}
}
