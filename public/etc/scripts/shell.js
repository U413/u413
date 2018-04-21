'use strict';

/**
 * Credits to mwgamera for the basic implementation idea for the shell.
**/

let shell;
todo.push(() => {
	let
		buffer = $id("buffer"),
		current = $id("current"),
		prompt = current.firstChild,
		stdin = $id("stdin");
	
	const path = {
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
	
	function realign() {
		stdin.style.textIndent = window.getComputedStyle(prompt).width;
	}
	
	function span(txt, k) {
		let el = document.createElement('span');
		el.innerText = txt;
		el.className = k;
		return el;
	}
	
	shell = {
		cmds: {
			// Simple one-liner commands don't need their own files
			async cd(rest) {
				let p = path.normalize(rest);
				if(!path.isAbsolute(p)) p = path.join(cwd, p);
				
				window.location.replace(p);
				return await new Promise(() => 0);
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
				buffer.innerHTML = "";
			},
			async pwd() {
				shell.log(cwd);
			},
			async echo(rest) {
				shell.log(rest);
			},
			async bulletin(rest) {
				return await fetch('post', '/dev/api/bulletin', rest).then(() => {
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
						await fetch('post', `/dev/api/topic`, JSON.stringify({
							board, title, body
						})).then(topic => {
							window.location.replace(`/var/${board}/${topic}`);
						});
					}
					else {
						shell.error("Need a board (try cd)");
					}
				})
			},
			async reply(body) {
				let m = /^\/var\/([^\/]+)\/([^\/]+)/.exec(cwd);
				if(m) {
					let [, board, topic] = m;
					await fetch('post', '/dev/api/reply', JSON.stringify({
						board, topic, body
					}), 'application/json').then(topic => {
						window.location.replace(`/var/${board}/${topic}`);
					});
				}
			},
			async useradd(rest) {
				let m = /(\S+)\s+(\S+)/.exec(rest);
				if(m) {
					await fetch("post", "/bin/useradd", `name=${m[1]}&pass=${m[2]}`, "application/x-www-form-urlencoded").
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
					await fetch("post", "/bin/login", `name=${m[1]}&pass=${m[2]}`, "application/x-www-form-urlencoded").
						then(res => window.location.reload()).
						catch(err => shell.error(err.xhr.response || "Unknown username or password"));
				}
				else {
					shell.error("Need both username and password");
				}
			},
			async logout() {
				await fetch("post", "/bin/logout").
					then(res => shell.log(res)).
					catch(err => shell.error(err));
			},
			async sql(rest) {
				if(user.name === "root") {
					await fetch("post", "/dev/sql", rest).
						then(res => shell.log(res)).
						catch(err => shell.error(err));
				}
				else {
					shell.error("/dev/sql is write-protected");
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
		// Do whatever it will with the current input
		async submit() {
			let value = stdin.value;
			stdin.value = "";
			
			let item = document.createElement('div');
			item.className = "item";
			prompt.remove();
			item.appendChild(prompt);
			item.appendChild(span(value, 'cmd'));
			buffer.appendChild(item);
			
			stdin.disabled = true;
			
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
			
			prompt = document.createElement("div");
			prompt.className = "prompt";
			prompt.appendChild(
				span(user.name, user.name === 'nobody'? 'nobody' : 'user')
			);
			prompt.appendChild(span("@"));
			prompt.appendChild(span("u413.com", "host"));
			prompt.appendChild(span(":"));
			prompt.appendChild(span(cwd, "cwd"));
			prompt.appendChild(span(user.access || "$", "access"));
			prompt.appendChild(span("\u00a0")); // nbsp
			
			current.appendChild(prompt);
			
			realign();
			stdin.focus();
		},
		// Target handler for the current input
		target: null,
		
		// Concatenate raw HTML to the buffer
		write(html) {
			buffer.innerHTML += html;
		},
		wrap(k, args) {
			this.write(args.map(v => `<div class="${k}">${v}</div>`).join(""));
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
			prompt.classList.remove("show-cli");
			prompt.classList.add("show-stdin");
			stdin.focus();
			
			return await new Promise((ok, no) => {
				this.target = async function(body) {
					prompt.classList.remove("show-stdin");
					prompt.classList.add("show-cli");
					cli.focus();
					
					ok(body);
				}
			});
		}
	};
	
	// Submit when ENTER is pressed without SHIFT
	stdin.addEventListener("keyup", ev => {
		if(ev.key === "Enter" && !ev.shift) {
			ev.preventDefault();
			shell.submit();
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
