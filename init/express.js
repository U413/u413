'use strict';

const
	crypto = require("crypto"),
	path = require("path"),
	qs = require("querystring"),
	express = require("express"),
	cookieParser = require("cookie-parser"),
	passport = require("passport"),
	bodyParser = require("body-parser");

const
	log = requireRoot("./log"),
	db = requireRoot("./db");

let router = module.exports = new express.Router();

log.info("init express");

router.use(cookieParser());

router.use(require("./session"));
router.use(require("./passport"));

router.use(async (req, res, next) => {
	res.locals.cwd = req.path;
	res.locals.user = req.user;
	next();
});

router.use(bodyParser.text());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
//router.use(bodyParser.json());

router.use((req, res, next) => {
	// Overwrite res.render with a proxy that echoes what it's rendering
	if(log.level === 'debug') {
		log.debug(req.method, JSON.stringify(req.originalUrl));
		
		const old = res.render;
		res.render = function(view, ...args) {
			log.debug("Rendering view", view);
			return old.call(this, view, ...args);
		}
	}
	log.silly(req);
	
	next();
});

router.use(requireRoot("./routes/"));
