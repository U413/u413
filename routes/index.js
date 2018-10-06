'use strict';

if(require.main === module) {
	console.error("STOP: You're running the wrong index.js!");
	process.exit(1);
}

const
	fs = require("fs"),
	path = require("path"),
	pug = require("pug"),
	sass = require("node-sass"),
	urlparse = require("url").parse,
	express = require("express"),
	serveStatic = require("serve-static");

const
	log = requireRoot("./log"),
	db = requireRoot("./db"),
	route = requireRoot("./route");

log.info("init routes");

const router = new express.Router();

router.get("^/$", route.dir("^/$", [
	'bin/', 'dev/', 'usr/', 'var/'
]));

router.get("/nohup.out", route.leaf(async (req, res, next) => {
	if(await db.user.inGroup(req.session.userid, "root")) {
		fs.readFile(__rootname + "/nohup.out", (error, nohup) => {
			if(error) {
				return res.render("error/404")
			}
			else {
				return res.render("ansi", {data: nohup + ""});
			}
		});
	}
	else {
		res.status(401).render("error/401");
	}
}));

router.use('^/etc/$', route.dir('^/etc/$', []));

router.use('^/etc/scripts/$', route.dir('^/etc/scripts/$', []));

router.use('/etc/scripts/prompt.tpl.js', route.cache(
	'public-optimized/etc/scripts/prompt.tpl.js',
	async (req, tpl) => {
		return `function renderPrompt(locals) {
			const config=${JSON.stringify(app.locals.config)};
			${pug.compileClient(tpl, {name: "renderPrompt"})};
			return renderPrompt(locals);
		}`;
	},
	'views/partial/prompt.pug'
));

router.use('^/etc/styles/$', route.dir('^/etc/styles/$', []));

router.use('/etc/styles/:name\.css', route.cache(
	req => `public-optimized${req.originalUrl}`,
	async req => await new Promise((ok, no) => {
		sass.render({
			// Rewrite .css to .scss
			file: `public/etc/styles/${req.params.name}.scss`
		}, (err, data) => {
			if(err) {
				no(err);
			}
			else {
				ok(data.css);
			}
		});
	}),
	/* async */ (req, update) => {
		return new Promise((ok, no) => {
			fs.stat(`public${req.originalUrl}`, (err, stat) => {
				ok(!!err || stat.mtime > update);
			});
		})
	}
));
//router.use('/etc/styles/', route.static("public/etc/styles/"));

router.use('/var/', require("./var"));
router.use('/dev/', require("./dev/"));
router.use('/bin/', require("./bin"));
router.use("/usr/", require("./usr"));

router.use(route.static('public-optimized'));
router.use(route.static('public'));

router.use(global.pre404);
router.use(require("./404"));

module.exports = router;
