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

function requestLogger() {
	if(level === 'silly') {
		const expressWinston = require("express-winston");

		expressWinston.requestWhitelist.push('body');
		expressWinston.requestWhitelist.push('headers');

		expressWinston.responseWhitelist.push('body');
		expressWinston.responseWhitelist.push('headers');

		console.log("Silly logger");
		return expressWinston.logger({
			winstonInstance: logger,
			level: 'silly',
			meta: true,
			expressFormat: true,
			colorize: true
		});
	}
	else if(level === 'debug') {
		return function(req, res, next) {
				module.exports.debug(
					req.method, JSON.stringify(req.originalUrl)
				);
				next();
		}
	}
	else {
		return null;
	}
}

if(level === 'silly') {
	module.exports = {
		level, requestLogger,
		error(...args) {
			logger.log('error', ...args);
			console.trace();
		},
		warn(...args) {
			logger.log("warn", ...args);
			console.trace();
		},
		info(...args) {
			logger.log('info', ...args);
			console.trace();
		},
		verbose(...args) {
			logger.log('verbose', ...args);
			console.trace();
		},
		debug(...args) {
			logger.log('debug', ...args);
			console.trace();
		},
		silly(...args) {
			logger.log('silly', ...args);
			console.trace();
		}
	}
}
else {
	module.exports = {
		level, requestLogger,
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
}
