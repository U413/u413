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
	
app.reload = function reload() {
	spawn("/bin/bash", ["tools/reload.sh", process.pid], {
		detached: true,
		stdio: 'inherit'
	}).unref();
}

const ipcname = 'private/ipc.sock';

if(fs.statSync(ipcname)) {
	fs.unlinkSync(ipcname);
}

net.createServer(conn => {
	conn.on('data', data => {
		data = (data + "").trim();
		switch(data) {
			case 'redeploy':
				if(app.redeploy) {
					return app.redeploy();
				}
				else {
					return conn.write("git webhooks are not enabled\n");
				}
			case "reload":
				return app.reload();
		}
	});
}).listen(ipcname);
