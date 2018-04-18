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

passport.serializeUser((user, done) => {
	done(null, user.id);``
});
passport.deserializeUser((id, done) => {
	db.user.byId(id).then(user => done(null, user || false));
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
		log.debug("/bin/useradd:", user);
		done(null, user);
	}
}));

log.info("init passport strategy local-login");
passport.use('local-login', new LocalStrategy({
	usernameField: "name",
	passwordField: "pass"
}, (name, pass, done) => {
	db.user.authenticate(name, pass).then(user => done(null, user || false));
}));

log.info("init passport strategy logout");
passport.use("logout", new LocalStrategy({}, (name, pass, done) => {
	// Always fail to authenticate
	done(null, false);
}));

router.use(passport.initialize());
router.use(passport.session());
