'use strict';

/**
 * Implement code that persists the user session data across resets.
**/

const
	fs = require("fs"),
	express = require("express"),
	sessions = require("client-sessions"),
	crypto = require("crypto");

const
	log = requireRoot("./log");

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

router.use(sessions({
	secret,
	cookieName: 'user',
	duration: 24*60*60*1000, // 24 hours
	activeDuration: 1000*60*5 // 5 minutes
}));
router.use((req, res, next) => {
	console.log('session', req.session);
	next();
})
