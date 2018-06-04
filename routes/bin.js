'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	express = require("express"),
	passport = require("passport")

const
	log = requireRoot("./log"),
	db = requireRoot('./db'),
	route = requireRoot("./route");

const router = module.exports = new express.Router();

router.use("^/$", route.dir("/bin/", [
	'login', 'logout', 'useradd',
	'newtopic', 'reply',
	'bulletin',
	'sql', 'ls'
]));

// Everything else in this directory is a leaf
router.use(route.leaf((req, res, next) => next()));

router.use('/login', (req, res, next) => {
	if(Array.isArray(req.body)) {
		req.body = req.body[1];
	}
	if(!req.body) {
		return res.status(400).end("Missing arguments");
	}

	next();
});
router.route('/login').
	post((req, res, next) => {
		passport.authenticate('local-login', (err, user, info) => {
			if(err) {
				res.status(500).end(err.stack + "");
			}
			else if(user) {
				req.login(user, err => {
					if(err) {
						res.status(500).end(err.stack + "");
					}
					else {
						log.debug("/bin/login:", user.name);
						res.status(200).end(JSON.stringify({name: user.name}));
					}
				});
			}
			else {
				res.status(400).end(info && info.message);
			}
		})(req, res, next);
	}).
	get((req, res, next) => {
		res.render('login');
	});

router.use('/logout', (req, res, next) => {
	// client-sessions is incompatible with passport's logout()
	//req.logout();
	req.user = {};
	res.json(true);
});

// Lazy workaround because LocalStrategy doesn't support custom parameters
//  (you can change the names, but not how you get them. POST body only.)
router.use('/useradd', (req, res, next) => {
	if(Array.isArray(req.body)) {
		req.body = req.body[0];
	}
	next();
});
router.route('/useradd').
	post(passport.authenticate('local-useradd', {
		successRedirect: '/var/bulletin',
		failureRedirect: '/bin/useradd'
	})).
	get((req, res, next) => {
		res.render('useradd');
	});

router.route("/groupadd").
	post(async (req, res, next) => {
		if(req.user && req.user.id && db.user.inGroup(req.user.id, "admin")) {
			if(!Array.isArray(req.body)) {
				return res.status(400).end("Missing arguments");
			}
			let opt = req.body[1];
			if(!opt) {
				return res.status(400).end("Missing status");
			}

			await db.group.create(opt.name);
			res.status(200).json(true);
		}
		else {
			res.status(401).end("You must be an admin to add a group");
		}
	});

router.use("/newtopic", async (req, res, next) => {
	if(req.user && req.user.id) {
		if(!Array.isArray(req.body)) {
			return res.status(400).end("Missing arguments");
		}
		let opt = req.body[1];

		if(!opt) {
			return res.status(400).end("Missing arguments");
		}

		let
			board = await db.board.byName(opt.board),
			topic = await db.topic.create(board.id, req.user.id, opt.title, opt.body);

		res.status(200).json(topic.id.toString(16));
	}
	else {
		res.status(401).end("You must be logged in");
	}
});

router.use("/reply", async (req, res, next) => {
	if(req.user && req.user.id) {
		if(!Array.isArray(req.body)) {
			return res.status(400).end("Missing arguments");
		}
		let opt = req.body[1];

		if(!opt || typeof opt.topic !== 'number') {
			return res.status(400).end("Topic id must be a number");
		}

		let reply = await db.topic.reply(opt.topic, req.user.id, opt.body);
		console.log(reply);
		res.status(200).json(reply);
	}
	else {
		res.status(401).end("You must be logged in");
	}
});

router.post("/bulletin", async (req, res, next) => {
	if(req.user && req.user.id) {
		let body = req.body;

		if(Array.isArray(body)) {
			body = body.slice(1).join(" ");
		}

		await db.bulletin.add(req.user, body);
		res.json(true);
	}
	else {
		res.status(401).end("You are not logged in");
	}
});

router.use("/sql", async (req, res, next) => {
	if(await db.user.inGroup(req.user.id, "root")) {
		if(!Array.isArray(req.body)) {
			return res.status(400).end("Missing arguments");
		}

		db.rawQuery(req.body.slice(1).join(" ")).then(
			data => {
				res.json(data);
			},
			err => {
				res.status(400).send(err.stack.toString());
			}
		);
	}
	else {
		res.status(403).end("You are not root!");
	}
});

async function checkDynamicDirs(target) {
	for(let d of route.dynamicDirs) {
		if(await d(target)) {
			return true;
		}
	}

	return false;
}
router.use("/ls", async (req, res, next) => {
	if(!req.body) {
		next();
	}

	let args = req.body;
	if(!Array.isArray(args)) {
		return res.status(400).end("Missing arguments");
	}
	let opt = args[1];
	if(!opt || !opt.target) {
		return res.status(400).end("Missing target parameter");
	}

	let target = opt.target + "";
	if(!target.endsWith("/")) {
		target += '/';
	}

	let j = await (route.readdir(target))(target, req);
	if(j === null) {
		res.status(404).end("Not Found");
	}
	else {
		res.json(j);
	}
});
