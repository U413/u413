'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	express = require("express"),
	passport = require("passport"),
	serveStatic = require("serve-static");

const
	log = requireRoot("./log"),
	db = requireRoot('./db'),
	route = requireRoot("./route");

const router = module.exports = new express.Router();

router.use(route.dir("^/usr/$", ['bin/']));
router.use(route.dir("^/usr/bin/$", []));
router.use("^/usr/bin/", route.static("public/usr/bin"))
