'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	express = require("express"),
	serveStatic = require("serve-static");

const
	log = require.main.require("./log");

log.info("init routes");

const router = new express.Router();

router.get(/^\/?$/g, (req, res) => {
	res.render('index');
});

router.use('/', serveStatic('public-optimized', {
	extensions: ['txt', 'md']
}));
router.use('/', serveStatic('public', {
	extensions: ['txt', 'md']
}));

router.use('/var/', require("./var"));
router.use('/dev/', require("./dev/"));
router.use('/bin/', require("./bin/"));
router.use(require("./bulletin"));

router.use(require("./404"));

module.exports = router;
