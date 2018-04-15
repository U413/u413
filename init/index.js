'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	express = require("express");

/**
 * Require as if the cwd was the root directory.
**/
global.requireRoot = require.main.require.bind(require.main);

// Require this early so it can hook into stdout
requireRoot("./routes/dev/stdout");

const
	db = requireRoot("./db"),
	log = requireRoot("./log");

/** DB init **/
log.info("init db/init.sql");
db.query('init');

let router = module.exports = new express.Router();

router.use(require("./express"));
router.use(require("./fs"));
