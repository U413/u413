'use strict';

const
	fs = require("fs"),
	db = require("./db");

/** DB init **/
db.query('init');

/**
 * Make sure we have the basic files which git ignores.
**/

// Empty directories

function touch_dir_if_missing(dn) {
	try {
		if(!fs.statSync(dn).isDirectory()) {
			console.warn(dn, "is not a directory");
		}
	}
	catch(e) {
		fs.mkdirSync(dn);
	}
}

['bin', 'etc', 'srv', 'tmp', 'usr', 'var'].map(
	v => touch_dir_if_missing(`public/${v}`)
);

// Files with user data

function build_if_missing(fn, init, msg) {
	fs.open(fn, "wx", (err, fid) => {
		if(!err) {
			console.log(msg);
			fs.write(fid, init, err => {
				if(!err) {
					fs.close(fid);
				}
			});
		}
	});
}

/*

build_if_missing(
	"public/etc/passwd.txt",
	"root:x:0:0:root:/usr/root:/bin/bash",
	"Building /etc/passwd"
);
build_if_missing(
	"public/var/bulletin.md", "", "Building /var/bulletin"
);

*/
