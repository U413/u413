'use strict';

const
	express = require("express"),
	bodyParser = require("body-parser"),
	cookieParser = require("cookie-parser"),
	serveIndex = require("serve-index"),
	serveStatic = require("serve-static"),
	path = require("path"),
	fs = require("fs");

const
	log = require("./log");

require("./init");

log.info("Building routes");

function logURL(req, res) {
	console.log(req.url);
}

const db = require("./db");

let app = express();

app.set('view engine', 'pug');

app.use(cookieParser());

app.use((req, res, next) => {
	req.user = req.cookies.user || "<<<FAKE>>>";
	next();
});

app.use((req, res, next) => {
	if(log.level === 'debug') {
		log.debug(req.method, req.originalURL);
		
		const old = res.render;
		res.render = function(view, ...args) {
			log.debug("Rendering view", view);
			return old(view, ...args);
		}
	}
	log.silly(req);
	
	next();
});

app.use("/dev/", require("./dev/index"));

app.get(/^\/?$/g, (req, res) => {
	res.render('index');
});
app.get('/var/bulletin', async (req, res) => {
	res.location('/var/bulletin');
	res.render('bulletin', {
		bulletin: (await db.bulletin.getAll()).rows,
		user: {
			id: "<<USER>>",
			prompt: "$"
		}
	});
});

// Directory listings
app.use('/', (req, res, next) => {
	let p = path.join('public', req.path);
	fs.stat(p, (err, stat) => {
		if(err || !stat.isDirectory()) {
			next();
		}
		else {
			// Make sure it ends with /
			res.location(path.normalize(req.path, '/'));
			fs.readdir(p, (err, files) => {
				//assert(err === null)
				res.render('ls', {
					directory: res.path,
					fileList: files.map(
						v => {
							return {
								name: v,
								get stat() {
									return fs.statSync(path.join(p, v));
								}
							};
						}
					),
					user: {
						id: "TEST",
						prompt: "$"
					}
				});
			});
		}
	});
});

app.use('/', serveStatic('public-optimized', {
	extensions: ['txt', 'md']
}));
app.use('/', serveStatic('public', {
	extensions: ['txt', 'md']
}));

// 404: Not found handling
app.use(function(req, res, next){
	res.status(404);

	// respond with html page
	if(req.accepts('html')) {
		res.render('404', {url: req.url});
	}
	// respond with json
	else if(req.accepts('json')) {
		res.send({error: 'Not found'});
	}
	// default to plain-text. send()
	else {
		res.type('txt').send('Not found');
	}
	
	log.error("Error 404:", req.url);
});

let port = process.env.PORT || 8080;
log.info("Listening on port", port);
app.listen(port);
