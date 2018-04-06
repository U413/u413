'use strict';

const
	express = require("express"),
	cookieParser = require("cookie-parser"),
	fs = require("fs");

const
	log = require("./log");

require("./init");

let app = express();

app.set('view engine', 'pug');

app.use(cookieParser());

app.use((req, res, next) => {
	var body = "";
	req.on("data", chunk => {
		body += chunk;
	});
	req.on("end", () => {
		req.body = body;
		next();
	})
})

app.use((req, res, next) => {
	req.user = req.cookies.user || "<<<FAKE>>>";
	next();
});

app.use((req, res, next) => {
	// Overwrite res.render with a proxy that echoes what it's rendering
	if(log.level === 'debug') {
		log.debug(req.method, JSON.stringify(req.originalUrl));
		
		const old = res.render;
		res.render = function(view, ...args) {
			log.debug("Rendering view", view);
			return old.call(this, view, ...args);
		}
	}
	log.silly(req);
	
	next();
});

app.use(require("./routes/"));

let port = process.env.PORT || 8080;
log.info("Listening on port", port);
app.listen(port);
