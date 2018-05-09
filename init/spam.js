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

const
	MAXTIMEOUT = 5000,
	MAXBUFLEN = 8,
	VARIANCE = 1,
	MAX404 = 10;

function banIP(ip, start) {
	/* TODO */
	let time = (Date.now() - start)/1000;
	log.info("Banned", ip, "after", time, "seconds (NotImplemented)");
}

function randAmount() {
	return ((Math.random() - 0.5)*VARIANCE + 1)/2;
}

function* htmlHoney() {
	yield "<!DOCTYPE html><html><head><title>Admin panel</title></head><body>";
	let depth = 0;
	while(true) {
		if(depth && Math.random() < 0.5) {
			--depth;
			yield "</div>";
		}
		else {
			++depth;
			yield "<div>";
		}
	}
}

function makeHoney(req) {
	if(req.accepts("html")) {
		req.type("html");
		return htmlHoney();
	}
}

function* byteify(it) {
	for(let s of it) {
		for(let c of s) {
			yield c;
		}
	}
}

function nextBytes(it, n) {
	let s = "";
	for(let i = 0; i < n; ++i) {
		let {value, done} = it.next();
		if(done) {
			break;
		}
		s += value;
	}
	return s;
}

// Middleware for handling spam
function spamTheSpammer(req, res) {
	log.info("Spamming", req.ip, "for accessing", req.originalUrl);
	// Set the status to 200 so they don't try to exit early
	res.status(200);
	// Pretend we're PHP too!
	res.setHeader("X-Powered-By", "PHP/5.4.0");
	
	let honey = byteify(makeHoney(req)), start = Date.now();
	
	let running = true;
	function spammy() {
		res.write(nextBytes(honey, randAmount()*MAXBUFLEN));
		setTimeout(() => {
			if(running) spammy();
		}, randAmount()*MAXTIMEOUT);
	}
	spammy();
	res.on('close', () => {
		running = false;
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
