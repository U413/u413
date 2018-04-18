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
app.locals.baseurl = `${config.scheme}://${config.domain}`;

app.use(require("./gitpush"));

app.use(require("./init/"));

let port = process.env.PORT || 8080;
log.info("Listening on port", port);
app.listen(port);
