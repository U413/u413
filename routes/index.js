'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	fs = require("fs"),
	path = require("path"),
	urlparse = require("url").parse,
	express = require("express"),
	sassMiddleware = require("node-sass-middleware"),
	serveStatic = require("serve-static");

const
	log = requireRoot("./log"),
	db = requireRoot("./db"),
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

router.use('/etc', (req, res, next) => {
	let local = path.join('public', req.originalUrl);
	fs.stat(local, async (err, stats) => {
		if(!err && stats.isDirectory()) {
			var virt = req.path === '/'?
				[ls.virtualStat({name: "passwd"})] : [];
			
			res.render("ls", {
				files: virt.concat(await ls.readdir(local))
			});
		}
		else {
			next();
		}
	})
});

// Temporary snippet
// TODO: replace sass-middleware with a homebrew method, since the cache for
//  this is too heavy.
fs.stat('public/etc/styles/main.css', (err, bla) => {
	if(!err) {
		fs.unlink('public/etc/styles/main.css');
	}
});
router.use('/etc/styles', sassMiddleware({
	src: path.dirname(require.main.filename) + "/public/etc/styles",
	debug: log.level === 'debug',
	outputStyle: "compressed"
}));

router.use("/etc/passwd", (req, res, next) => {
	db.user.list().then(users => {
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(users));
	})
})

router.use('/var/', require("./var"));
router.use('/dev/', require("./dev/"));
router.use('/bin/', require("./bin/"));

router.use(require("./404"));

module.exports = router;
