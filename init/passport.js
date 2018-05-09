'use strict';

const
	express = require("express"),
	passport = require("passport"),
	{Strategy: LocalStrategy} = require("passport-local"),
	bcrypt = require("bcrypt")

const
	log = requireRoot("./log"),
	db = requireRoot("./db");

const SALTS = 10;

let router = module.exports = new express.Router();

async function addAccess(user) {
	user.access =
		await db.user.inGroup(user.id, "root")? "#" : "$";
}

passport.serializeUser((user, done) => {
	// Passport and client-sessions don't get along perfectly - on
	//  error, passport sets req.user = null, but client-sessions
	//  throws if req.user is assigned a "non-object" (including null).
	//  SO, because this took ages to find and the errors it produces
	//  are insane, wrap it so we can better debug.
	try {
		done(null, user);
	}
	catch(e) {
		log.debug(e);
	}
});
passport.deserializeUser(async (id, done) => {
	try {
		let user = await db.user.byId(id);
		await addAccess(user);
		done(null, user || false);
	}
	catch(e) {
		done(e, null);
	}
})

log.info("init passport strategy local-useradd");
passport.use('local-useradd', new LocalStrategy({
	usernameField: 'name',
	passwordField: 'pass'
}, async (name, pass, done) => {
	let user = await db.user.byName(name);
	
	if(user) {
		done(null, false);
	}
	else {
		let hash = await bcrypt.hash(pass, SALTS);
		user = await db.user.add(name, hash);
		if(user) {
			await addAccess(user);
			log.debug("/bin/useradd:", user);
			done(null, user);
		}
		else {
			done(null, false);
		}
	}
}));

log.info("init passport strategy local-login");
passport.use('local-login', new LocalStrategy({
	usernameField: "name",
	passwordField: "pass"
}, async (name, pass, done) => {
	try {
		let user = await db.user.authenticate(name, pass);
		if(user) {
			await addAccess(user);
			done(null, user);
		}
		else {
			done(null, false);
		}
	}
	catch(err) {
		done(err, null);
	}
}));

router.use(passport.initialize());
router.use(passport.session());
