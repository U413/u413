'use strict';

const
	express = require("express"),
	path = require("path"),
	fs = require("fs");

const
	db = requireRoot("./db");

const router = new express.Router();

router.get('/bulletin', async (req, res) => {
	res.location('/var/bulletin');
	res.render('bulletin', {
		bulletin: await db.bulletin.getAll(),
		user: req.user,
		cwd: "/var/bulletin"
	});
});

// Get a topic
router.use("/:boardid/:topicid", async (req, res, next) => {
	let
		{boardname, topicid} = parseInt(req.params, 16),
		board = await db.board.byName(boardname),
		op = await db.topic.byId(topicid);
	
	if(!op) {
		return next();
	}
	
	let replies = await db.topic.replies(topicid);
	
	res.render("topic", {
		board,
		topic: {op, replies},
		user: req.user,
		cwd: "/var/" + board
	});
});

// List the topics in a board
router.use("/:board", async (req, res, next) => {
	let board = await db.board.byName(req.params.board);
	
	res.render("ls", {
		files: await db.topic.getAll(board.id).map(topic => {
			return {
				name: topic.id.toString(16),
				stat: {
					mtime: topic.mtime,
					size: undefined
				}
			}
		}),
		user: req.user,
		cwd: "/var/" + board.name
	});
});

// List the boards (directory listing)
router.use('/', async (req, res, next) => {
	res.render("ls", {
		files: [
			{
				name: "bulletin",
				// TODO: Get size of bulletin and last modified time
				stat: {}
			}
		].concat(await db.board.getAll()),
		user: req.user,
		cwd: "/var/"
	});
});

module.exports = router;
