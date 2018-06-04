'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	fs = require("fs"),
	path = require("path"),
	express = require("express");

/**
 * Require as if the cwd was the root directory.
**/
global.requireRoot = require.main.require.bind(require.main);

// Require this early so it can hook into stdout
requireRoot("./routes/dev/stdout");

const
	db = requireRoot("./db"),
	log = requireRoot("./log"),
	config = requireRoot("./config");

// Locals for pug rendering
global.locals = {};

if(log.level === 'silly') {
	const clog = console.log
	console.log = function log(...args) {
		let m = new RegExp(
			"Error\n    at .+?\n    at " +
				"(?:(\\S+) \\((.+?):(\\d+):(\\d+)\\)|(.+?):(\\d+):(\\d+))",
			'gm'
		).exec(new Error().stack);

		let dp = path.relative(__rootname, m[2] || m[5]);

		if(m[1]) {
			clog(`${m[1]} (${dp}:${m[3]}:${m[4]}):`, ...args);
		}
		else {
			clog(`${dp}:${m[6]}:${m[7]}:`, ...args);
		}
	}
}

/** DB init **/
log.info("init database");
db.query('init');

let router = module.exports = new express.Router();

router.use(require("./spam"));

router.use(require("./redeploy"));
router.use(require("./express"));
router.use(require("./fs"));

require("./markdown");
