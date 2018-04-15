'use strict';

let shell = {cmds: {}};

todo.push(() => {
	let
		prompt = $id("prompt"),
		buffer = $id("buffer"),
		cli = $id("cli"),
		stdin = $id("stdin");
	
	function get_input() {
		if(prompt.classList.contains("show-cli")) {
			return cli;
		}
		else if(prompt.classList.contains("show-stdin")) {
			return stdin;
		}
		else {
			throw new Error("Not showing any prompt?");
		}
	}
	
	shell = {
		cmds: {
			// Simple one-liner commands don't need their own files
			cd(rest) {
				window.location.replace(rest);
			},
			help(rest) {
				shell.log("Try lsbin");
			},
			lsbin() {
				shell.log(Object.keys(this).join(" "));
			},
			reload() {
				window.location.reload();
			},
			clear() {
				buffer.innerHTML = "";
				
				for(let child of Array.from(document.body.children)) {
					if(!child.classList.contains("shell")) {
						child.remove();
					}
				}
			},
			pwd() {
				shell.log(cwd);
			},
			echo(rest) {
				shell.log(rest);
			},
			bulletin(rest) {
				fetch('post', '/dev/api/bulletin', rest);
			},
			newtopic(title) {
				shell.read().then(body => {
					fetch('post', `/dev/api/topic`, JSON.stringify({
						cwd, title, body
					})).then(topic => {
						window.location.replace(`${cwd}/${topic.id}`);
					});
				})
			},
			
			...shell.cmds
		},
		get value() {
			return get_input().value;
		},
		set value(v) {
			cli.value = cli.placeholder = stdin.value = v;
		},
		// Utility for focusing on the current input
		focus() {
			let inp = get_input(), cvl = inp.value.length;
			inp.focus();
			inp.setSelectionRange(cvl, cvl);
		},
		// Do whatever it will with the current input
		submit() {
			if(typeof this.target === 'function') {
				let value = this.value;
				this.value = "";
				this.target(value);
				this.target = null;
			}
			else {
				let [, cmd, rest] = /^(\S+)\s*(.*)$/g.exec(this.value);
				if(cmd in this.cmds) {
					this.cmds[cmd](rest);
				}
				else {
					this.error(cmd + ": command not found");
				}
				this.value = "";
			}
		},
		// Target handler for the current input
		target: null,
		
		// Concatenate raw HTML to the buffer
		cat(html) {
			buffer.innerHTML += html;
		},
		wrap(k, args) {
			this.cat(args.map(v => `<div class="${k}">${v}</div>`).join(""));
		},
		log(...args) {
			this.wrap('item', args);
		},
		error(...args) {
			this.wrap('error', args);
		},
		
		// Read from stdin and fulfill a promise when it's submitted
		read() {
			cli.classList.remove("show-cli");
			cli.classList.add("show-stdin");
			
			return new Promise((ok, no) => {
				this.target = ok;
			});
		}
	};
	
	// Submit when ENTER is pressed without SHIFT
	prompt.addEventListener("keydown", ev => {
		if(ev.key === "Enter" && !ev.shift) {
			shell.submit();
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
	//prompt.addEventListener("click", focus);
	
	/*
	function stop_prop(ev) {
		return ev.stopPropagation();
	}
	
	//
	document.getElementsByTagName("main")[0].
		addEventListener("click", stop_prop);
	$id("shell").addEventListener('click', stop_prop)
	*/
});
