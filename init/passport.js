'use strict';

const
	passport = require("passport"),
	{Strategy: LocalStrategy} = require("passport-local"),
	bcrypt = require("bcrypt")

const
	log = requireRoot("./log"),
	db = requireRoot("./db");

const SALTS = 10;

passport.serializeUser((user, done) => {
	done(null, user.id);
});
passport.deserializeUser((id, done) => {
	db.user.byId(id).then(user => done(null, user || false));
})

log.info("init passport strategy local-useradd");
passport.use('local-useradd', new LocalStrategy({
	usernameField: 'name',
	passwordField: 'pass'
}, (name, pass, done) => {
	db.user.byName(name).then(user => {
		if(user) {
			done(null, false);
		}
		else {
			return bcrypt.hash(pass, SALTS);
		}
	}).then(hash => {
		return db.user.add(name, hash);
	}).then(user => {
		log.info("passport", user);
		done(null, user);
	});
}));

log.info("init passport strategy local-login");
passport.use('local-login', new LocalStrategy({
	usernameField: "name",
	passwordField: "pass"
}, (name, pass, done) => {
	db.user.authenticate(name, pass).then(user => done(null, user || false));
}));
