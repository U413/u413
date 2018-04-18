'use strict';

const
	express = require("express"),
	fs = require("fs");

const
	log = requireRoot("./log"),
	db = requireRoot("./db"),
	ls = requireRoot("./ls");

log.info("init /dev/api routes");
let router = new express.Router();

router.use(/^\/$/, (req, res) => {
	res.render('ls', {
		files: [
			ls.virtualStat({name: 'topic'}),
			ls.virtualStat({name: 'reply'}),
			ls.virtualStat({name: 'bulletin'})
		]
	});
});

router.use("/topic", async (req, res, next) => {
	if(req.user) {
		let
			data = JSON.parse(req.body),
			board = await db.board.byName(data.board);
		
		await db.topic.create(board.id, req.user.id, data.title, data.body);
		
		res.status(200).end("Success");
	}
	else {
		res.status(401).end("You must be logged in");
	}
});

router.use("/reply", async (req, res, next) => {
	if(req.user) {
		let
			topic = await db.topic.reply(req.body.topic, req.user.id, req.body.body);
		
		res.status(200).end(topic.id);
	}
	else {
		res.status(401).end("You must be logged in");
	}
})

router.post("/bulletin", async (req, res, next) => {
	if(req.user) {
		db.bulletin.add(req.user, req.body);
		res.end("Success");
	}
	else {
		res.status(401).end("You are not logged in");
	}
})

module.exports = router;
