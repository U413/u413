'use strict';

const
	fs = require("fs");

/**
 * Make sure we have the basic files which git ignores.
**/

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

build_if_missing(
	"public/etc/passwd.txt",
	"root:x:0:0:root:/usr/root:/bin/bash",
	"Building /etc/passwd"
);
build_if_missing(
	"public/srv/bulletin.md", "", "Building /srv/bulletin"
);
