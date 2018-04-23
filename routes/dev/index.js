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
	ls = requireRoot('./ls');

let router = new express.Router();

router.use("/stdout", require("./stdout"));
router.use('/', ls.enforceTrailingSlash());
router.use('/', (req, res, next) => {
	res.render('ls', {
		files: [
			ls.virtualStat({name: 'stdout'}),
		]
	});
});

module.exports = router;
