'use strict';

const
	express = require("express"),
	path = require("path"),
	fs = require("fs");

const router = new express.Router();

// Directory listings
router.use('/', (req, res, next) => {
	let p = path.join('public', req.path);
	fs.stat(p, (err, stat) => {
		if(err || !stat.isDirectory()) {
			next();
		}
		else {
			// Make sure it ends with /
			res.location(path.normalize(req.path, '/'));
			fs.readdir(p, (err, files) => {
				//assert(err === null)
				res.render('ls', {
					directory: res.path,
					fileList: files.map(
						v => {
							return {
								name: v,
								get stat() {
									return fs.statSync(path.join(p, v));
								}
							};
						}
					),
					user: {
						id: "TEST",
						prompt: "$"
					}
				});
			});
		}
	});
});

module.exports = router;
