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

require.root = __dirname;

let app = express();

require("./init/")(app);

let port = process.env.PORT || 8080;
log.info("Listening on port", port);
app.listen(port);
