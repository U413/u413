'use strict';

const
	express = require("express"),
	serveStatic = require("serve-static"),
	cookieParser = require("cookie-parser"),
	bodyParser = require("body-parser");

const
	log = requireRoot("./log"),
	db = requireRoot("./db"),
	config = requireRoot("./config");

let router = module.exports = new express.Router();

log.info("init express");

if(config.debug) {
	router.use(log.requestLogger());
}

if(config.debug) {
	// Monkeypatch response methods to see what we're doing.

	const
		res = require("express/lib/response"),
		oldRender = res.render,
		oldRedirect = res.redirect;

	res.render = function(view, ...args) {
		log.debug("Rendering view", view);
		return oldRender.call(this, view, ...args);
	}
	res.redirect = function(loc) {
		log.debug("Redirecting from", this.req.originalUrl, "to", loc);
		return oldRedirect.call(this, loc);
	}
}

router.use((req, res, next) => {
	res.locals.cwd = req.path;
	return next();
});

router.use(cookieParser());

router.use(require("./session"));
//router.use(require("./passport"));

router.use(bodyParser.text());
router.use(bodyParser.json({strict: false}));
router.use(bodyParser.urlencoded({extended: true}));

serveStatic.mime.define({'text/x-script.u413sh': ['u413sh']});

router.use(requireRoot("./routes/"));
