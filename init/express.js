'use strict';

const
	crypto = require("crypto"),
	path = require("path"),
	qs = require("querystring"),
	postcssMiddleware = require("postcss-middleware"),
	cookieParser = require("cookie-parser"),
	expressSession = require("express-session"),
	passport = require("passport"),
	bodyParser = require("body-parser"),
	cssnext = require("postcss-cssnext");

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
	
	let plugins = [cssnext];
	if(log.level === 'debug') {
		let cssnano = require("cssnano")();
		
		// cssnano has a duplicate dependency, "autoprefixer", which postCSS
		//  complains about, so rather than dangerously disabling the warning
		//  we'll manually remove it.
		for(let i = 0; i < cssnano.plugins.length; ++i) {
			if(cssnano.plugins[i].postcssPlugin === "autoprefixer") {
				cssnano.plugins.splice(i--, 1);
			}
		}
		
		plugins.push(cssnano);
	}
	app.use('/etc/styles', postcssMiddleware({
		src(req) {
			return path.dirname(require.main.filename) +
				'/public/etc/styles' + req.path;
		},
		plugins
	}));

	app.use(requireRoot("./routes/"));
}
