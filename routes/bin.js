'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	express = require("express");

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

router.route('/login').
	post(async (req, res, next) => {
		let body = req.body;
		if(!body) {
			return res.status(400).end("Missing arguments");
		}

		if(Array.isArray(body)) {
			body = body[1];
		}

		let {name, pass} = body;

		let user = await db.user.authenticate(name, pass);
		if(user) {
			let userobj = {
				name,
				access: (await db.user.inGroup(user.id, "root"))? "#" : "$"
			};
			req.session.userid = user.id;
			req.session.user = userobj;
			res.locals.user = userobj;
			console.log(userobj);

			log.debug("/bin/login:", name);
			return res.json(userobj);
		}
		else {
			return res.status(403).end("Invalid credentials");
		}
	}).
	get((req, res, next) => {
		return res.render('login');
	});

router.use('/logout', (req, res, next) => {
	if(!req.session.userid) {
		return res.json(false);
	}
	else {
		let userobj = {name: "nobody", access: "$"};
		req.session.userid = 0;
		req.session.user = userobj;
		res.locals.user = userobj;
		return res.json(true);
	}
});

router.route('/useradd').
	post(async (req, res, next) => {
		let body = req.body;

		if(Array.isArray(body)) {
			body = body[1];
		}

		let {name, pass} = body;
		let user = await db.user.byName(name);

		if(user) {
			return res.status(401).end("User already exists");
		}
		else {
			let userobj = {name, access: "$"};
			user = await db.user.add(name, pass);
			req.session.userid = user.id;
			req.session.user = userobj;
			res.locals.user = userobj;

			log.debug("/bin/useradd:", name);
			return res.json(userobj);
		}
	}).
	get((req, res, next) => {
		return res.render('useradd');
	});

router.route("/groupadd").
	post(async (req, res, next) => {
		if(await db.user.inGroup(req.session.userid, "admin")) {
			if(!Array.isArray(req.body)) {
				return res.status(400).end("Missing arguments");
			}
			let opt = req.body[1];
			if(!opt) {
				return res.status(400).end("Missing status");
			}

			await db.group.create(opt.name);
			return res.status(200).json(true);
		}
		else {
			return res.status(401).end("You must be an admin to add a group");
		}
	});

router.use("/newtopic", async (req, res, next) => {
	if(req.session.userid) {
		if(!Array.isArray(req.body)) {
			return res.status(400).end("Missing arguments");
		}
		let opt = req.body[1];

		if(!opt) {
			return res.status(400).end("Missing arguments");
		}

		let
			board = await db.board.byName(opt.board),
			topic = await db.topic.create(board.id, req.session.userid, opt.title, opt.body);

		return res.status(200).json(topic.id.toString(16));
	}
	else {
		return res.status(401).end("You must be logged in");
	}
});

router.use("/reply", async (req, res, next) => {
	if(req.session.userid) {
		if(!Array.isArray(req.body)) {
			return res.status(400).end("Missing arguments");
		}
		let opt = req.body[1];

		if(!opt || typeof opt.topic !== 'number') {
			return res.status(400).end("Topic id must be a number");
		}

		return res.status(200).json(
			await db.topic.reply(opt.topic, req.session.userid, opt.body)
		);
	}
	else {
		return res.status(401).end("You are not logged in");
	}
});

router.post("/bulletin", async (req, res, next) => {
	if(req.session.userid) {
		let body = req.body;

		if(Array.isArray(body)) {
			body = body.slice(1).join(" ");
		}

		await db.bulletin.add(req.session.userid, body);
		return res.json(true);
	}
	else {
		return res.status(401).end("You are not logged in");
	}
});

router.use("/sql", async (req, res, next) => {
	if(await db.user.inGroup(req.session.userid, "root")) {
		if(!Array.isArray(req.body)) {
			return res.status(400).end("Missing arguments");
		}

		return db.rawQuery(req.body.slice(1).join(" ")).then(
			data => {
				res.json(data);
			},
			err => {
				res.status(400).send(err.stack.toString());
			}
		);
	}
	else {
		return res.status(403).end("You are not root!");
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
		return next();
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
		return res.status(404).end("Not Found");
	}
	else {
		return res.json(j);
	}
});
