'use strict';

const
	express = require("express"),
	path = require("path"),
	fs = require("fs");

const
	db = requireRoot("./db");

const router = new express.Router();

// Directory listings
router.use('/', async (req, res, next) => {
	res.render("var", {
		boards: await db.board.getAll(),
		user: req.user,
		cwd: "/var/"
	});
});

module.exports = router;
