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

// Catch an IO error if private/gitpush.secret doesn't exist
try {
	log.info("init git webhook redeploy");
	
	const hash = crypto.createHash("sha1");
	hash.update(fs.readFileSync("private/gitpush.secret"));
	const secret = hash.digest("hex");
	console.log("The secret is", secret);

	router.use("/!!!gitpush!!!", (req, res, next) => {
		log.info("Request for !!!gitpush!!!");
		res.end("Success");
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
}
catch(e) {
	log.info("Failed to init git webhook redeploy, missing file");
}
