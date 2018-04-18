/**
 * Handle a github webhook
**/
'use strict';

const
	fs = require("fs"),
	express = require("express"),
	{spawn} = require("child_process"),
 	crypto = require("crypto");

const
	log = require("./log");

const router = module.exports = new express.Router();

log.info("init git webhook redeploy");

// Catch an IO error if private/gitpush.secret doesn't exist
try {
	var secret = fs.readFileSync("private/gitpush.secret") + "";
}
catch(e) {
	log.info("Failed to init git webhook redeploy, missing file");
	return;
}

const auth = crypto.createHmac('sha1', secret);

router.use("/!!!gitpush!!!", (req, res, next) => {
	log.info("Request for !!!gitpush!!!");
	res.end("Success");
	
	let body = "";
	req.on('data', chunk => {
		body += chunk;
	});
	req.on('end', () => {
		auth.update(body);
		console.log("Digest:", auth.digest('hex'));
	})
	
	console.log(req.headers);
	//if(req.get("X-Hub-Signature") === secret) {
		// TODO: save session data
		log.info("Redeploying server...");
		spawn("/bin/bash", ["tools/redeploy.sh", process.pid], {
			detached: true,
			stdio: 'inherit'
		}).unref();
	//}
	//else {
		//next();
	//}
});
