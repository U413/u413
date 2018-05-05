/**
 * Handle a github webhook
**/
'use strict';

const
	fs = require("fs"),
	qs = require("querystring"),
	express = require("express"),
	{spawn} = require("child_process"),
 	crypto = require("crypto");

const
	log = requireRoot("./log");

const router = module.exports = new express.Router();

log.info("init git webhook redeploy");

// Catch an IO error if private/redeploy.secret doesn't exist
try {
	var secret = fs.readFileSync("private/redeploy.secret") + "";
}
catch(e) {
	log.info("Failed to init git webhook redeploy, missing file");
	return;
}

const auth = crypto.createHmac('sha1', secret);

app.ipc.redeploy = function redeploy() {
	// TODO: save session data
	log.info("Redeploying server...");
	spawn("/bin/bash", ["tools/redeploy.sh", process.pid], {
		detached: true,
		stdio: 'inherit'
	}).unref();
}

router.use("/!!!gitpush!!!", (req, res, next) => {
	log.info("Request for !!!gitpush!!!");
	res.end("Success");
	
	let body = "";
	req.on('data', chunk => {
		body += chunk;
	});
	req.on('end', () => {
		let data = qs.parse(body);
		auth.update(data.payload);
		app.ipc.redeploy();
	});
});
