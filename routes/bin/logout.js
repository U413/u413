'use strict';

const
	passport = require("passport"),
	express = require("express");

const
	db = requireRoot("./db");

const router = module.exports = new express.Router();

router.use('/logout', passport.authenticate('logout', {
	failureRedirect: '/bin/login'
}));
