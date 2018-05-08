'use strict';

/**
 * Implement services that reduce spam.
**/

const
	fs = require("fs"),
	express = require("express"),
	honeypot = require("honeypot");

const
	log = requireRoot("./log");

const router = module.exports = express.Router();

const
	MAXTIMEOUT = 5000,
	MAXBUFLEN = 8,
	VARIANCE = 1/8,
	MAX404 = 10;

function banIP(ip) {
	/* TODO */
	log.info("Banned", ip, "(NotImplemented)");
}

function randAmount() {
	return ((Math.random() - 0.5)*VARIANCE + 1)/2;
}

function* htmlHoney() {
	yield "<!DOCTYPE html><html><head><title>Admin panel</title></head><body>";
	let depth = 0;
	while(true) {
		if(depth) {
			if(Math.random() < 0.5) {
				--depth;
				yield "</div>";
				continue;
			}
		}
		++depth;
		yield "<div>";
	}
}

function makeHoney(req) {
	if(req.accepts("html")) {
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
}

// Middleware for handling spam
function spamTheSpammer(req, res) {
	log.info("Spamming", req.ip, "for the crime of spamming");
	// Set the status to 200 so they don't try to exit early
	res.status(200);
	
	let honey = byteify(makeHoney(req));
	
	let running = true;
	function spammy() {
		setTimeout(() => {
			res.write(nextBytes(honey, randAmount()*MAXBYTELEN));
			if(running) spammy();
		}, randAmount()*MAXTIMEOUT);
	}
	res.on('close', () => {
		running = false;
		banIP(req.ip);
	});
}

global.pre404 = null;

const naughty = {};
try {
	log.info("init honeypot");
	const
		pot = new honeypot(fs.readFileSync("private/honeypot.api") + ""),
		passed = new Set();
	
	global.pre404 = function pre404(req, res, next) {
		let n = naughty[req.ip] = (naughty[req.ip]|0) + 1;
		
		if(passed.has(req.ip)) {
			if(n > MAX404) {
				log.info("Reached maximum 404:", req.ip);
				spamTheSpammer(req, res);
			}
			else {
				next();
			}
		}
		else {
			pot.query(req.ip, (err, res) => {
				if(!res) {
					passed.add(req.ip);
					next();
				}
				else {
					spamTheSpammer();
				}
			});
		}
	}
}
catch(e) {
	log.info("Failed to load private/honeypot.api");
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
}

router.use(/.*(php|ajax|drupal|jmx).*/i, spamTheSpammer);
