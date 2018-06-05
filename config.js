'use strict';

const
	fs = require("fs"),
	os = require("os");

const ENV = process.env;

/**
 * For local configuration, don't modify this file; instead, copy this to
 *  private/config.json and modify that.
**/
const defaults = {
	"user": null,
	"database": "u413",
	"domain": "u413.org",
	"scheme": "http",
	"name": "u413",
	"port": 8080,
	"host": "u413.org",
	"version": null,
	"webroot": "",
	"loglevel": "info",
	"debug": !!process.env.DEBUG
};

try {
	Object.assign(defaults,
		JSON.parse(fs.readFileSync("private/config.json"))
	);
}
catch(e) {}

module.exports = {
	...defaults,

	user: ENV.PGUSERNAME || ENV.USER || defaults.user || os.userInfo().username,
	database: process.env.PGDATABASE || process.env.DB || defaults.database,
	version: defaults.version || (fs.readFileSync("VERSION") + "").trim()
};
