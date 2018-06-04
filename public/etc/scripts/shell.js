'use strict';

const
	path = window.location.pathname,
	[, cwd, file] = /^(.*\/)(.*)?$/.exec(path);

const MainShell = (function() {
	/*** localStorage handling ***/

	const storage = {
		default: {
			env: {
				PATH: ["/usr/bin", "/bin"],
				USER: user.name,
				PWD: cwd,
				HOME: "/home/" + user.name,

				path, user
			},
			history: [],
			version: 1
		},

		reset() {
			console.info("Creating a new localStorage entry");
			localStorage.setItem(user.name, JSON.stringify(this.default));
			return this.default;
		},

		load() {
			let store = localStorage.getItem(user.name);
			if(store === null) {
				return this.reset();
			}
			else {
				store = JSON.parse(store);

				if(!store.version || store.version < this.default.version) {
					return this.reset();
				}

				return {
					env: Object.assign(store.env, this.default.env),
					history: store.history || def.history
				};
			}
		},
		store() {
			localStorage.setItem(user.name, JSON.stringify({
				env, history, version: this.default.version
			}));
		}
	};

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

	// Adjust the height of stdin so it fits all its contents

	function adjustHeight() {
		const stdin = shell.stdin;

		let
			outh = /(\d+)px/.exec(window.getComputedStyle(stdin).height)[1],
			diff = outh - stdin.clientHeight;

		// Prevent the height from biasing the next line
		stdin.style.height = 0;
		stdin.style.height = (stdin.scrollHeight + diff) + "px";
	}

	/*** History management ***/

	var {env, history} = storage.load();
	Object.assign(history, {
		tmp: [""].concat(history),
		line: 0,
		submit() {
			let value = shell.stdin.value;
			// Don't commit empty or repeated lines.
			if(value && value !== this[0]) {
				this.unshift(this.tmp[this.line] = value);
				storage.store();
				this.tmp = this.slice();
				this.tmp.unshift("");
				this.line = 0;
			}
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

	/*** Deferred event registration for when the window loads ***/

	todo.push(() => {
		shell.stdout = $id("stdout");
		shell.current = $id("current");
		shell.prompt = current.firstChild;
		shell.input = $id("input");
		shell.stdin = $id("stdin");
		shell.stdpass = $id("stdpass");

		// Submit when ENTER is pressed without SHIFT
		shell.stdin.addEventListener("keydown", ev => {
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
		shell.stdpass.addEventListener("keydown", ev => {
			if(!ev.shiftKey) {
				if(ev.key === "Enter") {
					shell.submit();
				}
				else {
					return;
				}
				ev.preventDefault();
				return false;
			}
		})

		// Automatically focus on the prompt on a click

		function focus() {
			let sel = document.getSelection();

			if(sel.type !== "Range" &&
				document.activeElement === document.body
			) {
				shell.focus();
			}
		}

		document.addEventListener('click', focus);

		shell.realign();

		shell.stdin.addEventListener('input', adjustHeight);
		document.addEventListener('resize', adjustHeight);

		window.addEventListener('unhandledrejection', ev => {
			ev.preventDefault();
			shell.error("Unhandled rejection:", ev.reason.stack);
		});
	});

	/*** Main shell implementation ***/

	return class MainShell extends Shell {
		constructor() {
			super(null, []);

			this.env = env;
			this.history = history;

			// Handler for the current input
			this.reader = null;

			// Elements, filled in when the window load todo runs
			this.stdout = null;
			this.current = null;
			this.prompt = null;
			this.input = null;
			this.stdin = null;
			this.stdpass = null;
		}

		echo(...args) {
			this.log(...args);
		}

		clear() {
			//this.stdout.innerHTML = "";
			// Faster?
			let div = this.stdout;
			while(div.firstChild) {
				div.removeChild(div.firstChild);
			}
		}

		// Utility for focusing on the current input
		focus() {
			let std = (this.input.className === "pass"? this.stdpass : this.stdin);

			let cvl = std.value.length;
			std.focus();
			std.setSelectionRange(cvl, cvl);
		}
		realign() {
			if(this.input.className === "pass") {
			  shell.stdpass.style.marginLeft =
			    window.getComputedStyle(shell.prompt).width;
			}
			else {
				this.stdin.style.textIndent =
					window.getComputedStyle(this.prompt).width;
			}
		}

		commitPrompt(value) {
			// Move the prompt to stdout
			this.prompt.remove();
			this.stdout.appendChild(
				tag('div', {class: "item"},
					this.prompt, value? tag('kbd', {class: 'cmd'}, value) : null
				)
			);
		}
		async submitInput(value) {
			try {
				await this.reader(value);
			}
			catch(e) {
				if(e instanceof ShellError) {
					this.error(e.message);
				}
				else {
					this.error(e.stack);
				}
			}
			this.reader = null;
		}
		// Do whatever it will with the current input
		async submit() {
			let value = stdin.value || stdpass.value;

			// Submit was called during a read, just handle returning the input
			if(typeof this.reader === 'function') {
				this.submitInput(value);

				if(this.input.className === "pass") {
					this.commitPrompt();
				}
				else {
					this.commitPrompt(value);
				}

				// Clear stdin so the command can run
				this.stdin.disabled = true;
				this.stdin.value = "";
				this.stdpass.value = "";

				return;
			}

			this.history.submit();

			// Clear stdin so the command can run
			this.stdin.disabled = true;
			this.stdin.value = "";
			this.stdpass.value = "";

			this.commitPrompt(value);

			// Actually execute the command (was deferred for stdout)
			if(typeof this.reader === 'function') {
				this.submitInput();
				this.reader = null;
			}
			else {
				try {
					let interp = new InterpreterVisitor(this);
					let res = await new ShellParser(value).parse().visit(interp);

					if(typeof res !== 'undefined' && res !== Symbol.for("void")) {
						this.log(res);
					}
				}
				catch(e) {
					if(e instanceof ShellError) {
						this.error(e.message);
					}
					else {
						this.error(e.stack);
					}
				}
			}

			// Reenable stdin
			this.stdin.disabled = false;

			let c = this.current, n = tag(
				'div', {id: 'current'}
			);
			n.innerHTML = renderPrompt({user, cwd: path});
			c.parentNode.replaceChild(this.current = n, c);
			this.prompt = n.firstChild;

			// Cleanup
			this.realign();
			this.stdin.focus();
		}

		wrap(k, args) {
			let item = document.createElement("div");
			item.className = "item";

			for(let a of args) {
				if(a === Symbol.for("void") || typeof a === 'undefined') {
					continue;
				}

				if(typeof a !== 'string') {
					a = JSON.stringify(a);
				}

				const RE = /(\n)|(\t)|( +)/g;
				let content = [], p = 0, m;
				while(m = RE.exec(a)) {
					if(p !== m.index) {
						content.push(a.slice(p, m.index));
					}
					p = RE.lastIndex;

					if(m[1]) {
						content.push(tag("br"));
					}
					else if(m[2]) {
						content.push(tag("span", {class: "tab"}, '\t'));
					}
					else {
						content.push("\u00a0".repeat(m[3].length));
					}
				}
				if(p !== a.length) {
					content.push(a.slice(p));
				}

				let t = tag('samp', {class: k}, ...content);
				item.appendChild(t);
			}
			this.stdout.appendChild(item);
		}
		log(...args) {
			this.wrap('item', args);
		}
		error(...args) {
			this.wrap('error', args);
		}
	};
})();

const shell = new MainShell();
