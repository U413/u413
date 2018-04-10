'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

/**
 * Require as if the cwd was the root directory.
**/
global.requireRoot = require.main.require.bind(require.main);

const
	db = requireRoot("./db"),
	log = requireRoot("./log");

/** DB init **/
log.info("init db/init.sql");
db.query('init');

require("./fs");
require("./passport");
