'use strict';

const
	bodyParser = require("body-parser"),
	passport = require("passport"),
	express = require("express");

const
	db = requireRoot("./db");

const router = new express.Router();

router.route('/login').
	post((req, res, next) => {
		passport.authenticate('local-login', (err, user, info) => {
			if(err) {
				res.status(500).end(err.stack + "");
			}
			else if(user) {
				req.logIn(user, err => {
					console.log("arguments", arguments);
					if(err) {
						res.status(500).end(err.stack + "");
					}
					else {
						res.status(200).end("Success");
					}
				});
			}
			else {
				res.status(400).end(info.message);
			}
		})(req, res, next);
	}).
	get((req, res, next) => {
		res.render('login', {
			user: req.user,
			cwd: "/bin/login"
		});
	});

module.exports = router;
