'use strict';

/**
 * This took 30 minutes to debug...
**/
if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	express = require("express"),
	bodyParser = require("body-parser");

let router = new express.Router();

router.use(bodyParser.json({type: "*/json"}));
router.use("/api", require("./api"));
router.use("/sql", require("./sql"));
router.use("/stdout", require("./stdout"));
router.use('/', (req, res, next) => {
	res.location('/dev/');
	res.render('ls', {
		directory: "something?",
		fileList: [
			{
				name: "/dev/",
				size: NaN,
				mtime: NaN
			}
		]
	});
});

module.exports = router;
