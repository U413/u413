'use strict';

const
	passport = require("passport"),
	{Strategy: LocalStrategy} = require("passport-local");

const
	log = requireRoot("./log"),
	db = requireRoot("./db");

passport.serializeUser((user, done) => {
	done(null, user.id);
});
passport.deserializeUser((id, done) => {
	db.user.byId(id).then(user => done(null, user));
})

log.info("init passport strategy local-useradd");
passport.use('local-useradd', new LocalStrategy({
	usernameField: 'name',
	passwordField: 'pass'
}, (name, pass, done) => {
	/* TODO: check for duplicate username */
	
	db.user.add(name, pass).then(user => {
		log.info("passport", user);
		done(null, user);
	});
}));

log.info("init passport strategy local-login");
passport.use('local-login', new LocalStrategy({
	usernameField: "name",
	passwordField: "pass"
}, (name, pass, done) => {
	db.user.authenticate(name, pass).then(user => done(null, user));
}));
