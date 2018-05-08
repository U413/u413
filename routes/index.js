'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	fs = require("fs"),
	path = require("path"),
	sass = require("node-sass"),
	urlparse = require("url").parse,
	express = require("express"),
	serveStatic = require("serve-static");

const
	log = requireRoot("./log"),
	db = requireRoot("./db"),
	ls = requireRoot("./ls");

log.info("init routes");

const router = new express.Router();

router.get(/^\/?$/, async (req, res) => {
	let files = [
		ls.virtualDir({name: 'bin'}),
		ls.virtualDir({name: 'dev'}),
		ls.virtualDir({name: 'var'})
	];
	
	files.push(...await ls.readdir('public'));
	
	res.render('ls', {
		files,
		user: req.user,
		cwd: '/'
	});
});

router.get("/nohup.out", (req, res, next) => {
	if(req.user && req.user.name === "root") {
		fs.readFile(
			path.join(path.parse(require.main.filename).dir, "/nohup.out"),
			(err, nohup) => {
				if(err) {
					res.status(500).end(err.stack);
				}
				else {
					res.render("ansi", {data: nohup + ""});
				}
			}
		);
	}
	else {
		res.status(401).end("Permission denied");
	}
})

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

// This seems very... idiomatic. I want a more general version I can reuse
// TODO: generalize this into a library
app.cache.styles = {};
router.use('/etc/styles', (req, res, next) => {
	let m = /^((.+?)(\.(s)?css))(\/)?$/.exec(req.originalUrl);
	let data = app.cache.styles[m[1]];
	if(m) {
		// Trailing slash, redirect if it exists
		if(m[5]) {
			// Only stat .scss because all .css is virtual
			fs.stat(`public${m[2]}.scss`, err => {
				// 404: not found
				if(err) {
					next();
				}
				else {
					res.redirect(m[1]);
				}
			});
			return;
		}
		// Serve .scss directly
		else if(m[3] === 's') {
			if(typeof data === 'undefined') {
				fs.readFile("public" + m[1], (err, data) => {
					if(err) {
						next();
					}
					else {
						res.type('scss').end(data);
					}
				});
			}
			else {
				res.type('scss').end(data);
			}
			return;
		}
		else {
			
		}
	}
	else {
		return next();
	}
	
	if(typeof data === 'undefined') {
		sass.render({
			// Rewrite .css to .scss
			file: `public${m[2]}.scss`
		}, (err, data) => {
			if(err || !data) {
				next();
			}
			else {
				data = data.css;
				app.cache.styles[m[1]] = data;
				res.type('css').end(data);
			}
		});
	}
	else {
		res.type('css').end(data);
	}
});

router.use("/etc/passwd", (req, res, next) => {
	db.user.list().then(users => {
		res.type('json').end(JSON.stringify(users));
	})
})

router.use('/var/', require("./var"));
router.use('/dev/', require("./dev/"));
router.use('/bin/', require("./bin"));

router.use(global.pre404);
router.use(require("./404"));

module.exports = router;
