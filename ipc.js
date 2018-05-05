'use strict';

/**
 * Makes it possible to communicate with the u413 server while it's running.
**/

const
	fs = require("fs"),
	net = require("net"),
	{spawn} = require("child_process");

const
	log = require("./log");

app.ipc = {
	reload() {
		spawn("/bin/bash", ["tools/reload.sh", process.pid], {
			detached: true,
			stdio: 'inherit'
		}).unref();
	},
	restart() {
		spawn("/bin/bash", ["tools/restart.sh", process.pid], {
			detached: true,
			stdio: 'inherit'
		}).unref();
	},
	ls() {
		console.log(Object.keys(this).join(" "));
	}
}

const ipcname = 'private/ipc.sock';

// Make sure there isn't a file where we want the socket.
if(fs.statSync(ipcname)) {
	fs.unlinkSync(ipcname);
}

net.createServer(conn => {
	conn.on('data', data => {
		data += '';
		let m = /^\s*(\S+)(.*)\s*$/.exec((data));
		if(m) {
			let fn = app.ipc[m[1]];
			if(typeof fn === 'function') {
				fn(m[2]);
			}
			else {
				log.error("Received invalid IPC signal:", JSON.stringify(data));
			}
		}
	});
}).listen(ipcname);
