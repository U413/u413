'use strict';

/**
 * Implement services that reduce spam.
**/

const
	fs = require("fs"),
	express = require("express");

const
	log = requireRoot("./log");

const router = module.exports = express.Router();

const MAX404 = 10;

function banIP(ip, start) {
/* TODO */
let time = (Date.now() - start)/1000;
log.info("Banned", ip, "after", time, "seconds (NotImplemented)");
}

// Middleware for handling spam
function spamTheSpammer(req, res) {
	log.info("Spamming", req.ip, "for accessing", req.originalUrl);
	let start = Date.now();
	res.on('close', () => {
		banIP(req.ip, start);
	});
}

global.pre404 = null;

const naughty = {};
global.pre404 = function pre404(req, res, next) {
	let n = naughty[req.ip] = (naughty[req.ip]|0) + 1;
	if(n > MAX404) {
		log.info("Reached maximum 404:", req.ip);
		spamTheSpammer(req, res);
	}
	else {
		next();
	}
}

router.use((req, res, next) => {
	if(/[?%=]|form|php|ajax|drupal|jmx/i.test(req.originalUrl)) {
		spamTheSpammer(req, res);
	}
	else {
		next();
	}
});
