'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	fs = require("fs"),
	express = require("express"),
	serveStatic = require("serve-static");

const
	log = requireRoot("./log"),
	ls = requireRoot("./ls");

log.info("init routes");

const router = new express.Router();

router.get(/^\/?$/g, async (req, res) => {
	let files = [
		ls.virtualDir({name: 'bin'}),
		ls.virtualDir({name: 'dev'}),
		ls.virtualDir({name: 'var'})
	];
	
	files.push(...await ls.readdir('public-optimized'));
	files.push(...await ls.readdir('public'));
	
	console.log(files);
	res.render('ls', {
		files,
		user: req.user,
		cwd: '/'
	});
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

router.use(require("./404"));

module.exports = router;
