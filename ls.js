'use strict';

const
	fs = require("fs"),
	path = require("path");

class VirtualStats {
	constructor(data) {
		this.name = data.name;
		this.filetype = data.filetype || 'f';
	}
	
	isDirectory() {
		return this.filetype === 'd';
	}
	isFile() {
		return this.filetype === 'f';
	}
	isBlockDevice() {
		return this.filetype === 'b;'
	}
	isCharacterDevice() {
		return this.filetype === 'c';
	}
	isSymbolicLink() {
		return this.filetype === "l";
	}
	isFIFO() {
		return false;
	}
	isSocket() {
		return this.filetype === 's';
	}
}

module.exports = {
	readdir(d) {
		return new Promise((ok, no) => {
			fs.readdir(d, (err, dir) => {
				if(err) {
					ok([]);
				}
				else {
					Promise.all(dir.map(f => {
						return new Promise((ok, no) => {
							fs.stat(path.join(d, f), (err, stat) => {
								if(err) {
									no(err);
								}
								else {
									stat.name = f;
									ok(stat);
								}
							});
						});
					})).then(ok, no);
				}
			});
		});
	},
	virtualStat(data) {
		return new VirtualStats(data);
	},
	virtualDir(data) {
		return new VirtualStats({
			filetype: 'd', ...data
		});
	},
	enforceTrailingSlash() {
		return function(req, res, next) {
			if(req.originalUrl[req.originalUrl.length - 1] !== '/') {
				res.redirect(req.originalUrl + '/');
			}
			else {
				next();
			}
		};
	}
}
