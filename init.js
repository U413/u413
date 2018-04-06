'use strict';

const
	fs = require("fs"),
	db = require("./db");

const log = require("./log");

/** DB init **/
log.info("Initializing via db/init.sql");
db.queryFile('init');

/**
 * Make sure we have the basic files which git ignores.
**/

// Empty directories

function touch_dir_if_missing(dn) {
	try {
		if(!fs.statSync(dn).isDirectory()) {
			log.warn(dn, "is not a directory");
		}
	}
	catch(e) {
		log.info("Creating directory", dn);
		fs.mkdirSync(dn);
	}
}

['bin', 'etc', 'srv', 'tmp', 'usr', 'var'].map(
	v => touch_dir_if_missing(`public/${v}`)
);
