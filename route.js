'use strict';

const
	path = require("path"),
	fs = require("fs"),
	mime = require("mime"),
	pathToRe = require("path-to-regexp"),
	serveStatic = require("serve-static");

const
	log = requireRoot("./log");

function fspromise(f) {
	return function(...args) {
		return new Promise((ok, no) =>
			f.call(fs, ...args, (err, val) => err? no(err) : ok(val))
		);
	}
}

/**
 * TODO: At the time of writing, fs.promises is "experimental"
**/
const
	fsreaddir = fspromise(fs.readdir),
	fsstat = fspromise(fs.stat),
	fsreadFile = fspromise(fs.readFile),
	fswriteFile = fspromise(fs.writeFile);

function fsexists(f) {
	return new Promise((ok, no) => fs.access(f, err => ok(!err)))
}

class VirtualStats {
	constructor(data) {
		if(typeof data === 'string') {
			data = {name: data};
		}

		if(typeof data.type === 'undefined') {
			if(data.name.endsWith('/')) {
				this.name = data.name.slice(0, -1);
				this.type = 'dir';
			}
			else {
				this.name = data.name;
				this.type = 'file';
			}
		}
		else {
			if(data.name.endsWith("/")) {
				this.name = data.name.slice(0, -1);
			}
			else {
				this.name = data.name;
			}
			this.type = data.type;
		}

		this.note = data.note || null;
		this.atime = data.atime || null;
		this.mtime = data.mtime || null;
		this.ctime = data.ctime || null;
		this.size = data.size;
	}

	isDirectory() {
		return this.type === 'dir';
	}
	isFile() {
		return this.type === 'file';
	}
}

// Combine public-optimized and public as one fs
async function collateReaddir(d) {
	let
		od = path.join("public-optimized", d),
		pd = path.join("public", d);

	let [opt, pub] = await Promise.all([
		fsreaddir(od).catch(() => []), fsreaddir(pd).catch(() => [])
	]);

	let dir = Array.from(new Set([...opt, ...pub]));
	for(let i = 0; i < dir.length; ++i) {
		let di = dir[i];
		// Prioritize public-optimized
		dir[i] = fsstat(path.join(
			opt.indexOf(di) === -1? pd : od, di
		)).then(v => {
			v.name = di;
			v.type = v.isDirectory()? 'dir' : 'file';
			v.mime = mime.lookup(di);
			return v;
		});
	}

	return await Promise.all(dir)
}

let dirs = [], handlers = [];

module.exports = {
	readdir(f) {
		for(let i = 0; i < dirs.length; ++i) {
			if(dirs[i](f)) {
				return handlers[i];
			}
		}

		return async function(req) {
			return null;
		}
	},
	/**
	 * Ensure that this route never ends with a trailing slash
	**/
	leaf(handler) {
		return function(req, res, next) {
			if(req.originalUrl.endsWith("/")) {
				res.redirect(req.originalUrl.slice(0, -1));
			}
			else {
				handler(req, res, next);
			}
		}
	},
	dir(path, ls) {
		if(typeof ls !== 'function') {
			let files = ls;
			ls = async () => files;
		}

		if(typeof path === 'string') {
			path = pathToRe(path);
		}

		if(typeof path !== 'function') {
			let p = path;
			path = v => {
				return p.test(v);
			}
		}
		dirs.push(path);

		async function readdir(target, req) {
			// If ls doesn't return an array, assume the route is bad
			let vls = await ls(req);
			if(vls === null) {
				return null;
			}

			const
				real = await collateReaddir(target),
				virt = vls.map(v => new VirtualStats(v)),
				files = real,
				names = files.map(v => v.name);

			// Combine them, prioritizing real files over virtual
			for(let i = 0; i < virt.length; ++i) {
				let vi = virt[i];
				if(names.indexOf(vi.name) === -1) {
					files.push(vi);
				}
			}

			return files.map(v => {
				function normalizeTime(t) {
					if(typeof t === 'number') {
						return t;
					}
					else if(t) {
						return t.getTime();
					}
					else {
						return null;
					}
				}

				return {
					name: v.name,
					mime: v.mime || null,
					mtime: normalizeTime(v.mtime),
					ctime: normalizeTime(v.ctime),
					atime: normalizeTime(v.atime),
					size: v.size,
					note: v.note || null,
					type: v.type || (v.isDirectory()? 'dir' : 'file')
				};
			});
		}
		handlers.push(readdir);

		return async function(req, res, next) {
			if(!path(req.originalUrl)) {
				return next();
			}

			// Handle the trailing slash policy
			if(!req.originalUrl.endsWith('/')) {
				return res.redirect(req.originalUrl + "/");
			}

			let files = await readdir(req.originalUrl, req);
			if(files === null) {
				return res.status(404).end("Not Found");
			}

			if(req.accepts('html')) {
				//Separate dirs and files to be listed separately
				const dl = [], fl = [];
				for(let f of files) {
					if(f.type === 'dir') {
						dl.push(f);
					}
					else if(f.type === 'file') {
						fl.push(f);
					}
					else {
						throw new Error("Invalid file type " + f.type);
					}
				}
				dl.sort((a, b) => a.name.localeCompare(b.name));
				fl.sort((a, b) => a.name.localeCompare(b.name));

				res.render('ls', {dl, fl});
			}
			// TODO: We'll make this better later
			else if(req.accepts('json')) {
				res.json(files);
			}
			else {
				res.status(406).end();
			}
		}
	},
	cache(out, gen, inp_or_dirty=async ()=>true) {
		let origout = out;
		if(typeof out === 'string') {
			let fn = out;
			out = req => fn;
		}

		if(typeof inp_or_dirty === 'string') {
			let inp = inp_or_dirty;
			var dirty = async update => {
				return !await fsexists(origout) ||
					(await fsstat(inp)).mtime > update;
			}
			var generate = async function(req) {
				return await gen(req, await fsreadFile(inp));
			}
		}
		else {
			var dirty = inp_or_dirty, generate = gen;
		}

		// Updates needs to be a dictionary to allow cache to handle
		//  more than one route. It also allows us to keep track of
		//  whether or not we've checked the cache.
		let start = Date.now(), updates = {};

		return async function(req, res, next) {
			if(req.originalUrl.endsWith("/")) {
				return res.redirect(req.originalUrl.slice(0, -1));
			}

			let nt = Date.now(), first = false;
			if(req.originalUrl in updates) {
				var update = updates[req.originalUrl];
			}
			else {
				var update = updates[req.originalUrl] = start;
				first = true;
			}

			// Only even consider checking if the cache is dirty
			//  when it's been longer than 10 secs
			if(first || nt - update > 10000) {
				if(await dirty(req, update)) {
					log.info("Caching", req.originalUrl);
					updates[req.originalUrl] = nt;
					let data = await generate(req), outf = out(req);
					await fswriteFile(outf, data);
					// We already have the data loaded, so send it
					//  directly rather than using sendFile
					return res.type(path.extname(outf)).send(data);
				}
			}

			res.sendFile(path.resolve(out(req)));
		}
	},

	static(f) {
		let ss = serveStatic(f);
		return function(req, res, next) {
			if(req.path.endsWith("/")) {
				res.redirect(req.originalUrl.slice(0, -1));
			}
			else {
				ss(req, res, next);
			}
		}
	}
};
