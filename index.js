'use strict';

const
	express = require("express");

const
	log = require("./log"),
	config = require("./config");

global.__rootname = __dirname;

let app = express();
global.app = app;

require("./ipc");

app.set('view engine', 'pug');
app.locals.config = config;
app.locals.path = require("path");
app.locals.baseurl = `${config.scheme}://${config.domain}`;
app.locals.ansicolor = require("ansicolor");

app.use(require("./init/"));
app.use((error, req, res, next) => {
	res.status(500).render('error/500', {error});
	if(config.debug) {
		log.error(error);
	}
})

Object.assign(app.locals, global.locals);

let port = process.env.PORT || 8080;
process.nextTick(function listen() {
	try {
		app.listen(port);
	}
	catch(e) {
		log.error("Failed to listen to port", port, "retrying...");
		timers.setTimeout(listen, 100);
		return;
	}

	log.info("Listening on port", port);
});
