'use strict';

const
	passport = require("passport"),
	{Strategy: LocalStrategy} = require("passport-local");

const
	db = requireRoot("./db");

passport.serializeUser((user, done) => {
	done(null, user.id);
});
passport.deserializeUser((id, done) => {
	db.user.byId(id).then(user => done(null, user));
})

passport.use('local-useradd', new LocalStrategy({
	usernameField: 'name',
	passwordField: 'pass'
}, (name, pass, done) => {
	console.log("Passport", name, pass);
	/* TODO: check for duplicate username */
	
	db.user.add(name, pass).then(user => done(null, user));
}));

passport.use('local-login', new LocalStrategy({
	usernameField: "name",
	passwordField: "pass"
}, (name, pass, done) => {
	db.user.authenticate(name, pass).then(user => done(null, user));
}));
