'use strict';

const
	path = require("path");

function isDir(p) {
	return p.endsWith("/");
}

module.exports = {
	/**
	 * Ensure that this route never ends with a trailing slash
	**/
	leaf(handler) {
		return function(req, res, next) {
			if(isDir(req.originalUrl)) {
				res.redirect(req.originalUrl.slice(0, -1));
			}
			else {
				handler(req, res, next);
			}
		}
	},
	/**
	 * Ensure that this route always ends with a trailing slash
	**/
	dir(handler) {
		return function(req, res, next) {
			if(isDir(req.originalUrl)) {
				handler(req, res, next);
			}
			else {
				res.redirect(req.originalUrl + '/');
			}
		}
	}
};
