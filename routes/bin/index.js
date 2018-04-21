'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	express = require("express");

const
	ls = requireRoot("./ls");

const router = new express.Router();

router.use(/^\/$/, (req, res) => {
	res.render('ls', {
		files: [
			ls.virtualStat({name: "login"}),
			ls.virtualStat({name: "logout"}),
			ls.virtualStat({name: "useradd"}),
		]
	})
})

router.use(require("./login"));
router.use(require("./logout"));
router.use(require("./useradd"));

module.exports = router;
