'use strict';

/**
 * Credits to mwgamera for the basic implementation idea for the shell.
**/

const
	path = window.location.pathname,
	[, cwd, file] = /^(.*\/)(.*)?$/.exec(path);

function clamp(v, hi, lo=0) {
	if(v > hi) {
		return hi;
	}
	else if(v < lo) {
		return lo;
	}
	else {
		return v;
	}
}

const $path = {
	normalize(p) {
		let a = (p[0] === '/');
		let f = p.split(/[\\\/]/g);
		for(let i = 0; i < f.length; ++i) {
			if(f[i] === "" || f[i] === '.') {
				f.splice(i--, 1);
			}
		}
		
		return (a? "/" : "") + f.join("/");
	},
	isAbsolute(p) {
		return (p[0] === '/');
	},
	join(...args) {
		let out;
		for(let arg of args) {
			if(out === undefined) {
				out = arg;
			}
			else {
				out += "/" + arg;
			}
		}
		return this.normalize(out);
	}
};

function span(txt, k) {
	let el = document.createElement('span');
	el.innerText = txt;
	el.className = k;
	return el;
}

/*
 * Create a promise that will never be fulfilled
 *  This is used for commands which reload the page so they don't
 *  exit early and write the prompt beforehand
**/
function liar() {
	return new Promise(() => 0);
}

let shell;
todo.push(() => {
	let
		stdout = $id("stdout"),
		current = $id("current"),
		prompt = current.firstChild,
		stdin = $id("stdin");
	
	function realign() {
		stdin.style.textIndent = window.getComputedStyle(prompt).width;
	}
	
	var env, history;
	const storage = {
		load() {
			let store = localStorage.getItem(user.name);
			if(store === null) {
				return {env: {}, history: []};
			}
			else {
				return JSON.parse(store);
			}
		},
		store() {
			localStorage.setItem(user.name, JSON.stringify({
				env, history
			}));
		}
	}
	
	try {
		var {env, history} = storage.load();
		if(!env) {
			env = {};
		}
		if(!history) {
			history = [];
		}
	}
	catch(e) {
		var env = {}, history = [];
	}
	Object.assign(history, {
		tmp: Array.from(history),
		line: 0,
		submit() {
			this.unshift(this.tmp[this.line] = stdin.value);
			storage.store();
			this.tmp = this.slice();
			this.tmp.unshift("");
			this.line = 0;
		},
		up() {
			this.tmp[this.line] = stdin.value;
			this.line = clamp(this.line + 1, this.tmp.length - 1);
			stdin.value = this.tmp[this.line];
			adjustHeight();
		},
		down() {
			this.tmp[this.line] = stdin.value;
			this.line = clamp(this.line - 1, this.tmp.length - 1);
			stdin.value = this.tmp[this.line];
			adjustHeight();
		},
		clear() {
			// In-place clear
			this.length = 0;
			this.tmp = [""];
			storage.store();
		}
	});
	
	shell = {
		env, history,
		set history(v) {
			throw new Error("Do not overwrite history");
		},
		stdout: stdout, stdin,
		cmds: {
			async set(rest) {
				let kv = /^\s*(\S+)\s*(.+)\s*$/g.exec(rest);
				if(kv) {
					shell.env[kv[1]] = kv[2];
				}
			},
			// Simple one-liner commands don't need their own files
			async cd(rest) {
				let p = $path.normalize(rest);
				if(!$path.isAbsolute(p)) p = $path.join(cwd, p);
				
				window.location.replace(p);
				return await liar();
			},
			async help(rest) {
				let out = (() => {
					switch(rest) {
						case 'cd': return "cd <file>";
						case "help": return "help [cmd]";
						case 'lsbin': return "lsbin - list all commands";
						case 'reload': return 'reload - reload the page';
						case 'clear': return 'clear - clear the page';
						case 'pwd': return 'pwd - Print Working Directory';
						case 'echo': return 'echo <stuff>';
						case 'bulletin': return 'bulletin <response>';
						case 'newtopic': return 'newtopic <title> ENTER <body>';
						case 'reply':
							return 'reply <body> (you must cd into the topic)';
						case 'useradd': return 'useradd <name> <pass>';
						case 'login': return 'login <name> <pass>';
						case 'logout': return 'logout';
						case 'sql': return 'sql <SQL command> (must be root)';
						
						default: return "Unknown command";
					}
				})();
				
				shell.log(out);
			},
			async lsbin() {
				shell.log(Object.keys(this).join(" "));
			},
			async reload() {
				return await new Promise(() => {
					window.location.reload();
				});
			},
			async clear() {
				stdout.innerHTML = "";
			},
			async pwd() {
				shell.log(cwd);
			},
			async echo(rest) {
				shell.log(rest);
			},
			async bulletin(rest) {
				return await fetch('post', '/bin/bulletin', rest).then(() => {
					window.location.reload();
				}).catch(err => {
					shell.error(err);
				})
			},
			async newtopic(title) {
				return await shell.read().then(async body => {
					let m = /^\/var\/([^\/]+)/.exec(cwd);
					if(m) {
						let board = m[1];
						await fetch('post', `/bin/newtopic`, JSON.stringify({
							board, title, body
						})).then(topic => {
							window.location.replace(`/var/${board}/${topic}`);
							return liar();
						}).catch(err => {
							shell.error(`${err.status}: ${err.xhr.response}`);
						});
					}
					else {
						shell.error("Need a board (try cd)");
					}
				})
			},
			async reply(body) {
				let m = /^\/var\/([^\/]+)\/([^\/]+)/.exec(path);
				if(m) {
					let [, board, topic] = m;
					await fetch('post', '/bin/reply', JSON.stringify({
						board, topic: parseInt(topic, 16), body
					}), 'application/json').then(() => {
						window.location.replace(`/var/${board}/${topic}`);
					}).catch(err => {
						shell.error(`${err.status}: ${err.xhr.response}`);
					});
				}
				else {
					shell.error("Need a topic (try cd)");
				}
			},
			async useradd(rest) {
				let m = /(\S+)\s+(\S+)/.exec(rest);
				if(m) {
					await fetch("post", "/bin/useradd", JSON.stringify({
						name: m[1],
						pass: m[2]
					}), "application/json").
						then(res => window.location.replace("/var/bulletin")).
						catch(err => shell.error(err));
				}
				else {
					shell.error("Need both username and password");
				}
			},
			async login(rest) {
				let m = /(\S+)\s+(\S+)/.exec(rest);
				if(m) {
					await fetch("post", "/bin/login", JSON.stringify({
						name: m[1],
						pass: m[2]
					}), "application/json").
						then(res => {
							bash.clear();
							user = JSON.parse(res);
						}).
						catch(err => shell.error(err.xhr.response || "Unknown username or password"));
				}
				else {
					shell.error("Need both username and password");
				}
			},
			async logout() {
				await fetch("post", "/bin/logout", "{}").
					then(res => {
						user = {name: 'nobody'};
						bash.clear();
					}).
					catch(err => shell.error(err));
			},
			async sql(rest) {
				if(user.name === "root") {
					await fetch("post", "/bin/sql", rest).
						then(res => shell.log(res)).
						catch(err => {
							shell.error(`${err.status}: ${err.xhr.response}`);
						});
				}
				else {
					shell.error("Permission denied");
				}
			},
			
			//...shell.cmds
		},
		// Utility for focusing on the current input
		focus() {
			let cvl = stdin.value.length;
			stdin.focus();
			stdin.setSelectionRange(cvl, cvl);
		},
		// Write the prompt to the stdout
		echoPrompt() {
			let item = document.createElement('div');
			item.className = "item";
			prompt.remove();
			item.appendChild(prompt);
			item.appendChild(span(stdin.value, 'cmd'));
			stdout.appendChild(item);
			
			stdin.disabled = true;
		},
		writePrompt() {
			prompt = document.createElement("div");
			prompt.className = "prompt";
			prompt.appendChild(
				span(user.name, user.name === 'nobody'? 'nobody' : 'user')
			);
			prompt.appendChild(span("@"));
			prompt.appendChild(span("u413.com", "host"));
			prompt.appendChild(span(":"));
			prompt.appendChild(span(path, "path"));
			prompt.appendChild(span(user.access || "$", "access"));
			prompt.appendChild(span("\u00a0")); // nbsp
			
			current.appendChild(prompt);
			
			realign();
			stdin.focus();
		},
		// Do whatever it will with the current input
		async submit() {
			storage.store();
			
			// Replace environment variables
			let value = stdin.value.replace(
				/(?!\\)\$(?:(\w+)|\{(\w+)\})/g, ($0, $1, $2) => {
				let k = $1 || $2;
				return k in this.env? this.env[k] : "";
			});
			console.log(value);
			this.echoPrompt();
			stdin.value = "";
			
			if(typeof this.target === 'function') {
				await this.target(value);
				this.target = null;
			}
			else {
				let m = /^(\S+)\s*(.*)/g.exec(value);
				if(m) {
					let [, cmd, rest] = m;
					if(cmd in this.cmds) {
						await this.cmds[cmd](rest);
					}
					else {
						this.error(cmd + ": command not found");
					}
				}
			}
			
			stdin.disabled = false;
			this.writePrompt();
		},
		// Target handler for the current input
		target: null,
		
		// Concatenate raw HTML to the stdout
		write(html) {
			stdout.innerHTML += html;
		},
		wrap(k, args) {
			this.write(args.map(v =>
				`<div class="${k}">` +
					v.
						replace(/\n/g, '<br/>').
						replace(/\t| {4}/g, span('tab', '\t'))
				+ "</div>"
			).join(""));
		},
		log(...args) {
			this.wrap('item', args);
		},
		error(...args) {
			if(args[0].xhr) {
				console.log(args[0].xhr);
			}
			this.wrap('error', args);
		},
		
		// Read from stdin and fulfill a promise when it's submitted
		async read() {
			stdin.disabled = false;
			stdin.style.textIndent = "0";
			stdin.focus();
			
			return await new Promise((ok, no) => {
				this.target = async function(body) {
					stdin.focus();
					ok(body);
					await liar();
				}
			});
		}
	};
	
	// Submit when ENTER is pressed without SHIFT
	stdin.addEventListener("keydown", ev => {
		if(!ev.shiftKey) {
			if(ev.key === "Enter") {
				shell.submit();
			}
			else if(ev.key === "ArrowUp") {
				shell.history.up();
			}
			else if(ev.key === "ArrowDown") {
				shell.history.down();
			}
			else {
				return;
			}
			ev.preventDefault();
			return false;
		}
	});
	
	// Automatically focus on the prompt on a click
	
	function focus() {
		let sel = document.getSelection();
		
		if(sel.type !== "Range" && document.activeElement === document.body) {
			shell.focus();
		}
	}
	
	document.addEventListener('click', focus);
	
	realign();
	
	function adjustHeight() {
		let
			[, outh] = /(\d+)px/.exec(window.getComputedStyle(stdin).height),
			diff = outh - stdin.clientHeight;
		
		// Prevent the height from biasing the next line
		stdin.style.height = 0;
		stdin.style.height = (stdin.scrollHeight + diff) + "px";
	}
	
	stdin.addEventListener('input', adjustHeight);
	document.addEventListener('resize', adjustHeight);
});
