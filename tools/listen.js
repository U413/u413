'use strict';

/**
 * Listen in real time to a provided http request.
**/

const
	http = require("http"),
	{URL} = require("url");

try {
	var u = new URL(process.argv[2]);
}
catch(e) {
	var u = new URL('http://' + process.argv[2]);
}

let opts = {
	hostname: u.hostname,
	port: u.port,
	path: u.pathname
};
console.log("Sending request with", opts);

http.request(opts, res => {
	console.log("Got response", res);
	res.socket.on('data', data => {
		console.log(/\d+\r\n(.+)/m.exec(data + "")[1].trim());
	});
	res.socket.on('error', err => console.error(err, err.stack));
}).end();
