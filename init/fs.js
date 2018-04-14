'use strict';

const
	fs = require("fs");

const
	log = requireRoot("./log");

module.exports = function(app) {
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

	['bin', 'etc', 'srv', 'tmp', 'usr', 'var'].map(
		v => touch_dir_if_missing(`public/${v}`)
	);
	
	touch_dir_if_missing("private");
	touch_dir_if_missing("private/cache");
}
