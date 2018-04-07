'use strict';

const
	passport = require("passport"),
	express = require("express");

const
	db = requireRoot("./db");

const router = new express.Router();

router.route('/login').
	post(passport.authenticate('local-login', {
		successRedirect: '/var/bulletin',
		failureRedirect: '/bin/login'
	})).
	get((req, res, next) => {
		res.render('login', {
			user: req.user,
			cwd: "/bin/login"
		});
	});

module.exports = router;
