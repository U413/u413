'use strict';

const
	fs = require("fs"),
	pug = require("pug");

const
	log = requireRoot("./log");
	
module.exports = (a, b, next) => next();

log.info("init fs");

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
/*
['bin', 'etc', 'srv', 'tmp', 'usr', 'var'].map(
	v => touch_dir_if_missing(`public/${v}`)
);
*/
touch_dir_if_missing("private");
touch_dir_if_missing("public-optimized");
touch_dir_if_missing("public-optimized/etc");
touch_dir_if_missing("public-optimized/etc/scripts");
touch_dir_if_missing("public-optimized/etc/styles");

fs.readFile("nohup.out", (err, data) => {
	const MAXLEN = 1024*100
	if(!err && data.length > MAXLEN) {
		log.info("Truncating nohup.out");
		// Truncate to the max length, then remove the first line which is
		//  probably incomplete now
		data = (data + "").slice(-MAXLEN).split(/\n/g).slice(1).join("\n");
		fs.writeFile("nohup.out", data, err => {
			if(err) {
				log.error(err);
			}
		});
	}
});

fs.readFile("private/u413.pid", (err, pid) => {
	try {
		process.kill((pid + "")|0, 0);
		log.info("Killed old u413 instance");
	}
	catch(err) {}
	
	log.info("init pidfile");
	fs.writeFile("private/u413.pid", process.pid + "", err => {
		if(err) {
			log.error(err);
		}
	});
});
