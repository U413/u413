'use strict';

/**
 * Makes it possible to communicate with the u413 server while it's running.
**/

const
	fs = require("fs"),
	net = require("net");
	
const ipcname = 'private/ipc.sock';

function mkserver() {
	net.createServer(conn => {
		conn.on('data', data => {
			data = data + "";
			switch(data) {
				case 'redeploy': return app.redeploy();
				
			}
		});
	}).listen(ipcname);
}

fs.stat(ipcname, (err, stats) => {
	if(stats) {
		fs.unlink(ipcname, () => {
			mkserver();
		})
	}
	else {
		mkserver();
	}
})
