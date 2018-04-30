'use strict';

const
	express = require("express"),
	path = require("path"),
	fs = require("fs"),
	hl = require("highlight.js");

const
	db = requireRoot("./db"),
	route = requireRoot("./route"),
	ls = requireRoot("./ls");

const router = new express.Router();

router.get('/bulletin', route.leaf(async (req, res) => {
	res.render('bulletin', {
		bulletin: await db.bulletin.getAll()
	});
}));

// Get a topic
router.use("/:boardid/:topicid", route.leaf(async (req, res, next) => {
	let
		boardname = req.params.boardname,
		topicid = parseInt(req.params.topicid, 16);
	
	// NaN
	if(topicid !== topicid) {
		return next();
	}
	
	let
		op = await db.topic.byId(topicid),
		board = await db.board.byName(boardname);
	
	if(!op) {
		return next();
	}
	
	op.author = await db.user.byId(op.author);
	
	let replies = await db.topic.replies(topicid);
	
	res.render("topic", {
		board,
		topic: {op, replies}
	});
}));

// List the topics in a board
router.use("/:board/", route.dir(async (req, res, next) => {
	let board = await db.board.byName(req.params.board);
	
	if(board) {
		ls.handle([
			...await Promise.all(
				(await db.topic.getAll(board.id)).map(async topic => {
					let author = await db.user.byId(topic.author);
					return ls.virtualStat({
						name: topic.id.toString(16).padStart(2, '0'),
						note: `**${topic.title}** by _${author.name}_`
					});
				})
			)
		])(req, res, next);
	}
	else {
		next();
	}
}));

// List the boards (directory listing)
router.use('/', route.dir(
	ls.handle(async () => [
		ls.virtualStat("bulletin"),
		...(await db.board.getAll()).map(board => ls.virtualDir(board))
	])
));

module.exports = router;
