'use strict';

class ShellError extends Error {}
ShellError.prototype.name = "ShellError";

async function invokeBin(cmd, args) {
	let res = await fetch(cmd, {
		method: "POST",
		body: JSON.stringify(args),
		credentials: "same-origin",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		}
	});

	if(res.ok) {
		return res.json();
	}
	else {
		throw new ShellError(res.status + ": " + await res.text());
	}
}

class shReturn /* extends Error */ {
	constructor(value) {
		this.value = value;
	}
}

// Whitelist of variables to forward to subshell environments
const WHITELIST = [
	"PATH", "USER", "PWD", "HOME", "path", "user"
];

class Cache {
	constructor(expire) {
		this.expire = expire;
		this.name = this.constructor.name;

		let local = localStorage.getItem(this.name);
		if(local) {
			this.cache = JSON.parse(local);
		}
		else {
			console.info("Creating", this.name);
			this.cache = {};
			localStorage.setItem(this.name, "{}");
		}
	}

	clear() {
		console.info("Clearing", this.name);
		localStorage.setItem(this.name, "{}");
		this.cache = {};
	}

	async generate(name, ...args) {
		throw new Error("Not implemented Cache.generate");
	}

	async update(name, ...args) {
		console.info(this.name + ": ", name);
		let data = await this.generate(name, ...args);
		this.cache[name] = {data, expire: Date.now() + this.expire};
		localStorage.setItem(this.name, JSON.stringify(this.cache));

		return data;
	}

	async get(name, ...args) {
		if(name in this.cache) {
			let c = this.cache[name];
			if(c.expire > Date.now()) {
				return c.data;
			}
		}

		return await this.update(name, ...args);
	}
}

class FetchCache extends Cache {
	constructor() {
		super(1000*60*60);
	}

	async generate(name, opt) {
		let res = await fetch(name, opt);
		if(res.ok) {
			return await res.text();
		}
		else {
			throw new ShellError(res.status + ": " + await res.text());
		}
	}
}

class LsCache extends Cache {
	constructor() {
		super(1000*60);
	}

	async generate(target) {
		return await invokeBin("/bin/ls", ["/bin/ls", {target}]);
	}
}

async function fetchStatic(name, opt) {
	return await fetchStatic.cache.get(name, opt);
}
fetchStatic.cache = new FetchCache();
const lsCache = new LsCache();

class Shell {
	constructor(parent, stdout, whitelist=WHITELIST) {
		this.parent = parent;
		this.stdout = stdout;
		this.interpreter = new InterpreterVisitor(this);
		this.env = {};
		this.whitelist = whitelist;
	}

	// Probably override this
	echo(...args) {
		return this.stdout.echo(...args);
	}

	getEnv(env) {
		if(env in this.env) {
			return this.env[env];
		}
		else if(this.whitelist.indexOf(env) !== -1) {
			return this.parent.getEnv(env);
		}
	}
	setEnv(env, val) {
		return this.env[env] = val;
	}

	async getExecutable(cmd) {
		if(cmd.startsWith("/")) {
			return async (shell, args)=> {
				return await invokeBin(cmd, args);
			}
		}
		else {
			for(let d of this.getEnv("PATH")) {
				for(let f of await lsCache.get(d)) {
					// Strip the extension
					let fn = /(.+?)(?:\.(?:u413sh|js))?$/.exec(f.name)[1];
					if(cmd !== fn) {
						continue;
					}

					if(f.mime === "text/x-script.u413sh") {
						let src = await fetchStatic(
							d + "/" + f.name, {
								credentials: "same-origin"
							}
						);
						let ast = new ShellParser(src).parse();

						return async (shell, args) => {
							try {
								return await shell.interpret(d + "/" + f.name, ast, args);
							}
							catch(e) {
								if(e instanceof shReturn) {
									return e.value;
								}
								else {
									throw e;
								}
							}
						}
					}
					else if(f.mime === "application/javascript") {
						let src = await fetchStatic(
							d + "/" + f.name, {
								credentials: "same-origin"
							}
						);

            let jsfun = (new Function(
    					"'use strict';" +
							"return async function $" + fn.replace(/[^$_a-z\d]/i, "_") +
							"(subshell, argv){" +
								src + "}"
    				))();

            return async (shell, args) => {
              return await jsfun.call(window, shell, args);
            }
					}
          // Relative path to static executable
					else {
						return async (shell, args) => {
							return await invokeBin(d + f.name, args);
						}
					}
				}
			}
			throw new ShellError(cmd + ": command not found");
		}
	}

	async exec(cmd) {
		let args = cmd.args;
		cmd = await this.eval(cmd.cmd);

		let shargs = await Promise.all(args.map(v => this.eval(v)));
		shargs.unshift(cmd);

		return await (await this.getExecutable(cmd))(this, shargs);
	}

	async eval(ast) {
		return await ast.visit(this.interpreter);
	}

	async interpret(name, ast, args) {
		let subshell = new Shell(this, this);

		for(let i = 0; i < args.length; ++i) {
			subshell.setEnv(i, args[i]);
		}
		return ast.visit(subshell.interpreter);
	}
}

class InterpreterVisitor {
	constructor(shell) {
		this.shell = shell;
	}

	async visitCmd(cmd) {
		return await this.shell.exec(cmd);
	}

	async visitObj(obj) {
		let v = {};
		for(let i = 0; i < obj.keys.length; ++i) {
			v[await obj.keys[i].visit(this)] = await obj.vals[i].visit(this);
		}
		return v;
	}

	async visitArr(arr) {
		return await Promise.all(arr.vals.map(v => v.visit(this)));
	}

	async visitEnv(env) {
		let name = (await env.name.visit(this)) + "";
		let v = name.split('.'), obj = this.shell.getEnv(v.shift());

		// Evaluate any indexing, e.g. $x.y
		for(let d of v) {
			obj = obj[d];
		}
		return obj;
	}

	async visitTemplate(tpl) {
		let v = [];
		for(let p of tpl.parts) {
			v.push(await p.visit(this));
		}

		return v.join('');
	}

	async visitVal(val) {
		return val.value;
	}

	async visitIf(node) {
		if(await node.cond.visit(this)) {
			return await node.body.visit(this);
		}
		else if(node.alt) {
			return await node.alt.visit(this);
		}
	}

	async visitFor(node) {
		let iter = (await node.iter.visit(this)) + "";

		let v = [];
		for(let x of await node.able.visit(this)) {
			this.shell.setEnv(iter, x);
			let b = await node.body.visit(this);

			if(b === Symbol.for("void")) {
        v = [];
      }
			else if(typeof b !== 'undefined') {
				v.push(b);
			}
		}

		return v;
	}

	async visitProg(prog) {
		let last;
		for(let v of prog.cmds) {
			let next = await v.visit(this);
			// Note: Symbol.for("void") is truthy
			if(next) {
				last = next;
			}
		}
		return last;
	}
}
