'use strict';

const
	path = require("path");

function isDir(p) {
	return p[p.length - 1] === '/';
}

module.exports = {
	leaf(handler) {
		return function(req, res, next) {
			if(isDir(req.path)) {
				res.redirect(req.originalUrl.slice(0, -1));
			}
			else {
				handler(req, res, next);
			}
		}
	}
};
