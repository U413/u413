'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	express = require("express");

const router = new express.Router();

router.use(require("./login"));
router.use(require("./useradd"));

module.exports = router;
