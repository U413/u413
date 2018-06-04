'use strict';

/**
 * This took 30 minutes to debug...
**/
if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	express = require("express")

const
	route = requireRoot("./route");

let router = new express.Router();

router.use("/stdout", require("./stdout"));
router.use('/', route.dir('/dev/', ['stdout']));

module.exports = router;
