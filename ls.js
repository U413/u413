'use strict';

const
	fs = require("fs"),
	path = require("path");

class VirtualStats {
	constructor(data) {
		this.name = data.name;
		this.filetype = data.filetype || 'f';
		this.note = data.note || "";
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
		if(typeof data === "string") {
			return new VirtualStats({name: data});
		}
		else {
			return new VirtualStats(data);
		}
	},
	virtualDir(data) {
		if(typeof data === "string") {
			return new VirtualStats({filetype: 'd', name: data});
		}
		else {
			return new VirtualStats({
				filetype: 'd', ...data
			});
		}
	},
	handle(ls) {
		if(typeof ls !== 'function') {
			let files = ls;
			ls = function() { return files; }
		}
		
		return async function(req, res, next) {
			let files = await ls(req);
			if(files) {
				if(req.accepts('html')) {
					res.render('ls', {files});
				}
				else if(req.accepts('json')) {
					return JSON.stringify(files);
				}
				else {
					res.status(406).end();
				}
			}
			else {
				next();
			}
		}
	}
}
