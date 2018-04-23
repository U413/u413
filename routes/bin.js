'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	express = require("express"),
	passport = require("passport")

const
	ls = requireRoot("./ls"),
	log = requireRoot("./log"),
	db = requireRoot('./db');

const router = new express.Router();

router.use(/^\/$/, (req, res) => {
	res.render('ls', {
		files: [
			ls.virtualStat({name: "login"}),
			ls.virtualStat({name: "logout"}),
			ls.virtualStat({name: "useradd"}),
			ls.virtualStat({name: "newtopic"}),
			ls.virtualStat({name: "reply"}),
			ls.virtualStat({name: "bulletin"}),
			ls.virtualStat({name: "sql"}),
		]
	})
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
				res.status(400).end(info);
			}
		})(req, res, next);
	}).
	get((req, res, next) => {
		res.render('login');
	});

router.use('/logout', (req, res, next) => {
console.log("HELLO??");
	// client-sessions is incompatible with passport's logout()
	//req.logout();
	req.user = {};
	res.end("Success");
});

router.route('/useradd').
	post(passport.authenticate('local-useradd', {
		successRedirect: '/var/bulletin',
		failureRedirect: '/bin/useradd'
	})).
	get((req, res, next) => {
		res.render('useradd');
	});

router.use("/newtopic", async (req, res, next) => {
	if(req.user) {
		let
			data = JSON.parse(req.body),
			board = await db.board.byName(data.board);
			
		console.log("user", req.user);
		let topic = await db.topic.create(board.id, req.user.id, data.title, data.body);
		
		res.status(200).end(topic.id.toString(16));
	}
	else {
		res.status(401).end("You must be logged in");
	}
});

router.use("/reply", async (req, res, next) => {
	if(req.user) {
		console.log("Reply?", req.body, req.user);
		await db.topic.reply(req.body.topic, req.user.id, req.body.body);
		
		res.status(200).end("Success");
	}
	else {
		res.status(401).end("You must be logged in");
	}
});

router.post("/bulletin", async (req, res, next) => {
	if(req.user) {
		await db.bulletin.add(req.user, req.body.slice(0, 140));
		res.end("Success");
	}
	else {
		res.status(401).end("You are not logged in");
	}
});

router.use("/sql", (req, res, next) => {
	if(req.user.name === "root") {
		db.rawQuery(req.body).then(
			data => {
				res.send(JSON.stringify(data));
			},
			err => {
				res.status(400).send(err.stack.toString());
			}
		)
	}
	else {
		res.status(403).end("You are not root!");
	}
});

module.exports = router;
