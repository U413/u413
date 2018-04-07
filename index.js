'use strict';

const
	crypto = require("crypto"),
	fs = require("fs"),
	qs = require("querystring"),
	express = require("express"),
	expressSession = require("express-session"),
	cookieParser = require("cookie-parser"),
	passport = require("passport"),
	bodyParser = require("body-parser");

const
	log = require("./log");

require("./init/");


let app = express();

app.set('view engine', 'pug');

app.use(cookieParser());
// Generate a new secret every time the server is run
app.use(expressSession({
	secret: crypto.randomBytes(32) + "",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
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

app.use(require("./routes/"));

let port = process.env.PORT || 8080;
log.info("Listening on port", port);
app.listen(port);
