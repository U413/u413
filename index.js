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
	log = require("./log"),
	config = require("./config");

require.root = __dirname;

let app = express();
global.app = app;

require("./ipc");

app.set('view engine', 'pug');
app.locals.config = config;
app.locals.path = require("path");
app.locals.baseurl = `${config.scheme}://${config.domain}`;
app.locals.ansicolor = require("ansicolor");

app.use(require("./init/"));
Object.assign(app.locals, global.locals);

let port = process.env.PORT || 8080;
process.nextTick(function listen() {
	try {
		app.listen(port);
	}
	catch(e) {
		log.error("Failed to listen to port", port, "retrying...");
		timers.setTimeout(listen, 100);
		return;
	}
	
	log.info("Listening on port", port);
});
