'use strict';

const
	request = require("request");

request.get("http://localhost:8080/srv/bulletin.md",
(err, res, body) => {
	console.log(err, body, res.headers);
})
