'use strict';

/**
 * Makes it possible to communicate with the u413 server while it's running.
**/

const
	fs = require("fs"),
	net = require("net");

fs.open("private/ipc.sock", 'w+', (err, fd) => {
	if(err) {
		throw err;
	}
	else {
		let sock = new net.Socket({fd, readable: true, writable: true});
		
		sock.on('data', data => {
			console.log("Got data");
			data = data + "";
			switch(data) {
				case 'redeploy': return app.redeploy();
				
			}
		})
	}
})
