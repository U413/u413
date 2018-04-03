'use strict';

const
	express = require("express"),
	bodyParser = require("body-parser"),
	cookieParser = require("cookie-parser"),
	serveIndex = require("serve-index"),
	path = require("path"),
	fs = require("fs");

require("./init");

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

app.use("/dev", require("./dev/index"));

app.get(/^\/?$/g, (req, res) => {
	res.location('/');
	res.render('index');
});
app.get('/var/bulletin', async (req, res) => {
	res.location('/var/bulletin');
	res.render('bulletin', {
		bulletin: await db.getAllBulletin(),
		user: {
			id: "<<USER>>",
			prompt: "$"
		}
	});
});

app.use(logURL);

app.use('/dev', (req, res, next) => {
	res.location('/dev/');
	res.render('ls', {
		directory: p,
		fileList: [
			{
				name: "/dev/",
				size: NaN,
				mtime: NaN
			}
		]
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
						prompt: ">"
					}
				});
			});
		}
	});
});

app.use(express.static('public', {
	extensions: ['txt', 'md']
}));

let port = process.env.PORT || 8080;
console.log("Listening on port " + port);
app.listen(port);
