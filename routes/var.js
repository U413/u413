'use strict';

const
	express = require("express");

const
	db = requireRoot("./db"),
	route = requireRoot("./route");

const router = module.exports = new express.Router();

router.get("/", route.dir("/var/",
	async req => ['bulletin', ...await db.board.getAll()]
));

router.get('/bulletin', route.leaf(async (req, res) => {
	res.render('bulletin', {
		bulletin: await db.bulletin.getAll()
	});
}));

// List the topics in a board
router.get("/:board", route.dir("/var/:board",
	async req => {
		let board = await db.board.byName(req.params.board);

		if(board) {
			return await Promise.all(
				(await db.topic.getAll(board.id)).map(async topic => {
					let author = await db.user.byId(topic.author);
					return {
						name: topic.id.toString(16).padStart(2, '0'),
						note: `**${topic.title}** by _${author.name}_`
					};
				})
			);
		}
		else {
			return null;
		}
	}
));

// Get a topic
router.get("/:boardname/:topicid", route.leaf(async (req, res, next) => {
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
	op.created = op.created.getTime();

	let replies = await db.topic.replies(topicid);

	res.render("topic", {
		board,
		topic: {op, replies}
	});
}));
