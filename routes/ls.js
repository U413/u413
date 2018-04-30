'use strict';

const
	express = require("express"),
	path = require("path"),
	fs = require("fs");

const
	ls = requireRoot("./ls");

const router = module.exports = new express.Router();

// Directory listings
router.use('/', (req, res, next) => {
	let p = path.join('public', req.path);
	fs.stat(p, (err, stat) => {
		if(err || !stat.isDirectory()) {
			next();
		}
		else {
			if(req.path.endsWith('/')) {
				ls.handle(await ls.readdir(p))(req, res, next);
			}
			else {
				// Make sure it ends with /
				res.redirect(path.normalize(req.path, '/'));
			}
		}
	});
});
