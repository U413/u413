'use strict';

const
	express = require("express"),
	path = require("path"),
	fs = require("fs");

const
	db = requireRoot("./db"),
	ls = requireRoot("./ls");

const router = new express.Router();

router.get('/bulletin', async (req, res) => {
	res.location('/var/bulletin');
	res.render('bulletin', {
		bulletin: await db.bulletin.getAll()
	});
});

// Get a topic
router.use("/:boardid/:topicid", async (req, res, next) => {
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
	
	console.log(op.author);
	op.author = await db.user.byId(op.author);
	
	let replies = await db.topic.replies(topicid);
	
	res.render("topic", {
		board,
		topic: {op, replies}
	});
});

router.use("/:board", ls.enforceTrailingSlash());

// List the topics in a board
router.use("/:board", async (req, res, next) => {
	let board = await db.board.byName(req.params.board);
	
	if(board) {
		res.render("ls", {
			files: (await db.topic.getAll(board.id)).map(topic => {
				return ls.virtualStat({name: topic.id.toString(16)});
			})
		});
	}
	else {
		next();
	}
});

router.use('/', ls.enforceTrailingSlash());

// List the boards (directory listing)
router.use('/', async (req, res, next) => {
	res.render("ls", {
		files: [
			ls.virtualStat({name: "bulletin"})
		].concat((await db.board.getAll()).map(board => {
			return ls.virtualStat({name: board.name})
		}))
	});
});

module.exports = router;
