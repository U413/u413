'use strict';

const
	qs = require("querystring"),
	passport = require("passport"),
	express = require("express");

const
	db = requireRoot("./db");

const router = new express.Router();

router.route('/useradd').
	post(passport.authenticate('local-useradd', {
		successRedirect: '/var/bulletin',
		failureRedirect: '/bin/useradd'
	})).
	get((req, res, next) => {
		res.render('useradd', {
			user: req.user,
			cwd: "/bin/useradd"
		});
	});

module.exports = router;
