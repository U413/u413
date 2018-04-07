'use strict';

const
	express = require("express");

const
	db = require.main.require("./db");

const router = new express.Router();

router.get('/var/bulletin', async (req, res) => {
	res.location('/var/bulletin');
	res.render('bulletin', {
		bulletin: await db.bulletin.getAll(),
		user: req.user,
		cwd: "/var/bulletin"
	});
});

module.exports = router;
