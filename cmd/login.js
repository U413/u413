'use strict';

const
	db = require("../db"),
	user = require("../user");

module.exports = async function(req, res, args) {
	let rows = await db.query("SELECT * FROM users WHERE name=?;");
	return res.end(JSON.stringify({
		"type": "token",
		"token": user.login(rows[0].id)
	}));
}
