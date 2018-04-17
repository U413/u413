'use strict';

const
	passport = require("passport"),
	express = require("express");

const
	db = requireRoot("./db");

const router = module.exports = new express.Router();

router.use('/logout', passport.authenticate('logout', (err, user) => {
	if(user) {
		res.status(500).end("Failed to logout?");
	}
	else {
		res.status(200).end("Success");
	}
}));
