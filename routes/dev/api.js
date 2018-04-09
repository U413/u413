'use strict';

const
	express = require("express"),
	Q = require("q"),
	fs = require("fs");

const
	open = Q.denodeify(fs.open),
	close = Q.denodeify(fs.close),
	read = Q.denodeify(fs.read),
	write = Q.denodeify(fs.write),
	fs_stat = Q.denodeify(fs.stat);

const
	log = require.main.require("./log"),
	db = require.main.require("./db");

async function stat(f) {
	try {
		return await fs_stat(f);
	}
	catch(e) {
		return null;
	}
}

const SEP = "******";

function pinky(ok, no) {
	return function(err, data) {
		err? no(err) : ok(data);
	}
}

function sanitize(text) {
	if(text) {
		// Replace control characters
		text = text.replace(/[\x00-\x1f]/g, "�");
		// Convert separators to --- so we can use ****** as a separator.
		text = text.replace(
			/^\*{3,}$/g, m => "-".repeat(m[0].length)
		);
		return text;
	}
	else {
		return "";
	}
}

function make_id(n) {
	const DIGITS =
		"!$*+,-."
		"0123456789" +
		// Excluded: C O P S U V W X Y Z
		"ABDEFGHIJKLMNQRT" + "_" +
		// Excluded: i l o u
		"abcdefghjkmnpqrstvwxyz";
	
	let s = "";
	while(n) {
		s += DIGITS[n%DIGITS.length];
		n = (n/DIGITS.length)|0;
	}
	
	return s;
}

log.info("Building /dev/api routes");
let router = new express.Router();

router.use("/topic", async (req, res, next) => {
	let {board, title, body} = req.body;
	
	body = body || "";
	if(board && title) {
		if(!await stat(board)) {
			next();
			return;
		}
		let fid = await open("srv/next", "rw");
		let next = (await read(fid)).toString();
		await write(fid, next + 1);
		await close(fid);
		
		let id = make_id(next);
		
		fid = await open(`srv/${board}/${id}`, "w");
		await write(fid,
			`# ${title}\n` +
			`## [usr/${user}](${user}) : <time>${new Date()}</time>\n` +
			sanitize(body) + SEP
		);
		await close(fid);
		
		res.send(`srv/${board}/${id}`);
	}
	else {
		res.status(406).send("{board title body}");
	}
});

router.use("/reply", async (req, res, next) => {
	let {board, parent, body} = req.body;
	if(!board || !parent) {
		return res.status(406).send("{board parent body}");
	}
	
	if(
		await stat(`srv/${board}`) &&
		await stat(`srv/${board}/${topic}`)
	) {
		let fid = await open(`srv/${board}/${topic}`, "a");
		await write(
			`## [usr/${user}](${user}) : <time>${new Date()}</time>\n` +
			sanitize(body) + SEP
		);
		await close(fid);
		res.send(`srv/${board}/${id}`);
	}
	else {
		next();
	}
})

router.post("/bulletin", async (req, res, next) => {
	if(req.user) {
		db.bulletin.add(req.user, req.rawBody);
		res.end("Success");
	}
	else {
		res.status(401).end("You are not logged in");
	}
})

module.exports = router;
