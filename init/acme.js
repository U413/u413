'use strict';

/**
 * Handle ACME protocol for SSL CA.
**/

const
	acme = require("acme-client"),
	express = require("express");

const
	log = requireRoot("./log"),
	config = requireRoot("./config");

log.info("init ACME (SSL auto-cert)")

let client = null, token = null, keyauth = null;

function recertify() {
	if(client) {
		const [key, csr] = await acme.openssl.createCsr({
			commonName: config.domain
		});
		const cert = await client.auto({
			csr,
			email: config.email,
			termsOfServiceAgreed: true,
			challengeCreateFn(authz, challenge, key) {
				if(challenge.type === 'http-01') {
					token = challenge.token;
					keyauth = key;
				}
			},
			challengeRemoveFn(authz, challenge, keyauth) {
				if(challenge.type === 'http-01') {
					token = keyauth = null;
				}
			}
		});
	}
}

async function register() {
	log.info("Creating ACME account");
	var privkey = await acme.openssl.createPrivateKey();
	acme.writeFile("private/acme.pem", privkey);
	
	client = new acme.Client({
		directoryUrl: acme.directory.letsencrypt.staging,
		accountKey: privkey
	});
	
	recertify();
}

app.ipc.acme = function(rest) {
	if(rest === "register") {
		register();
	}
	else if(rest === "recertify") {
		recertify();
	}
}

try {
	var privkey = acme.readFileSync("private/acme.pem");
}
catch(e) {
	if(config.email) {
		register();
	}
	else {
		log.info("Cannot load or create ACME account, SSL disabled.");
		return;
	}
}

const router = module.exports = new express.Router();
router.use("/.well-known/acme-challenge/:token", (req, res, next) => {
	if(token && req.params.token === token) {
		res.end(keyauth);
	}
});
