'use strict';

const
	crypto = require("crypto"),
	path = require("path"),
	qs = require("querystring"),
	sassMiddleware = require("node-sass-middleware"),
	cookieParser = require("cookie-parser"),
	expressSession = require("express-session"),
	passport = require("passport"),
	bodyParser = require("body-parser");

const
	log = requireRoot("./log");

module.exports = function(app) {
	log.info("init express");
	
	app.set('view engine', 'pug');

	app.use(cookieParser());
	
	// Generate a new secret every time the server is run
	const secret = crypto.randomBytes(32) + "";
	app.use(expressSession({
		secret: secret,
		resave: false,
		saveUninitialized: false
	}));
	log.silly("Session secret:", secret);
	
	require("./passport")(app);
	
	app.use(bodyParser.raw());
	app.use((req, res, next) => {
		var body = "";
		req.on("data", chunk => {
			body += chunk;
		});
		req.on("end", () => {
			req.rawBody = body;
			req.body = qs.parse(body);
			next();
		})
	});

	app.use((req, res, next) => {
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
	
	app.use('/etc/styles', sassMiddleware({
		src: path.dirname(require.main.filename) + "/public/etc/styles",
		debug: log.level === 'debug',
		//outputStyle: "compressed"
	}));
	
	app.use(requireRoot("./routes/"));
}
