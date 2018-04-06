'use strict';

const
	express = require("express");

const
	db = require.main.require("./db");

const router = new express.Router();

router.get('/var/bulletin', async (req, res) => {
	res.location('/var/bulletin');
	res.render('bulletin', {
		bulletin: (await db.bulletin.getAll()).rows,
		user: {
			name: "<<USER>>",
			prompt: "$",
			cwd: "/var/bulletin"
		}
	});
});

module.exports = router;
