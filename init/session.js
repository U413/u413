'use strict';

/**
 * Implement code that persists the user session data across resets.
**/

const
	fs = require("fs"),
	session = require("express-session"),
	express = require("express"),
	crypto = require("crypto");

const
	log = requireRoot("./log"),
	db = requireRoot("./db");

const router = module.exports = new express.Router();

log.info("init sessions");

try {
	var secret = fs.readFileSync("private/session.secret") + "";
	log.info("Loaded session.secret from file");
}
catch(e) {
	var secret = crypto.randomBytes(32) + "";
	fs.writeFileSync("private/session.secret", secret);
	log.info("Generated session.secret");
}

fs.readFile(__rootname + "/node_modules/connect-pg-simple/table.sql", (err, table) => {
	db.rawQuery(table + "").catch(e => 0);
});

const SessionStore = require("connect-pg-simple")(session);

const T_24H_MS = 24*60*60*1000;
router.use(session({
	cookie: {
		expires: T_24H_MS
	},
	secret,
	store: new SessionStore({pool: db.pool}),
	resave: false,
	saveUninitialized: false
}));

router.use((req, res, next) => {
	if(typeof req.session.userid === "undefined") {
		req.session.userid = 0;
		req.session.user = {name: "nobody", access: "$"};
	}

	res.locals.user = req.session.user;

	return next();
});
