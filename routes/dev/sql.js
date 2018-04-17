'use strict';

const
	log = require.main.require("./log"),
	db = require.main.require("./db");

log.info("init /dev/sql");

module.exports = (req, res, next) => {
	if(req.user.name === "root") {
		db.rawQuery(req.body).then(
			data => {
				res.send(JSON.stringify(data));
			},
			err => {
				res.status(400).send(err.stack.toString());
			}
		)
	}
	else {
		res.status(403).end("You are not root!");
	}
}
