'use strict';

/**
 * Makes it possible to communicate with the u413 server while it's running.
**/

const
	fs = require("fs"),
	net = require("net");
	
const ipcname = 'private/ipc.sock';

if(fs.statSync(ipcname)) {
	fs.unlinkSync(ipcname);
}

net.createServer(conn => {
	conn.on('data', data => {
		data = data + "";
		switch(data) {
			case 'redeploy': return app.redeploy();
			
		}
	});
}).listen(ipcname);
