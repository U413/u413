/**
 * Handle a github webhook
**/
'use strict';

const
	express = require("express"),
	{execFile} = require("child_process"),
 	crypto = require("crypto");

const
	log = require("./log");

const router = module.exports = new express.Router();

// Catch an IO error if private/gitpush.secret doesn't exist
try {
	log.info("init git webhook redeploy");
	
	const hash = crypto.createHash("sha1");
	hash.update(fs.readFileSync("private/gitpush.secret"));
	const secret = "sha1=" + hash.digest("hex");

	router.post("!!!gitpush!!!", (req, res, next) => {
		if(req.get("X-Hub-Signature") === secret) {
			// TODO: save session data
			execFile("tools/redeploy.sh", [process.pid]);
			throw new Error("UNREACHABLE");
		}
		else {
			next();
		}
	});
}
catch(e) {
	log.info("Failed to init git webhook redeploy, missing file");
}
