'use strict';

const MAXBUF = 1024*64;

const
	log = requireRoot("./log");

log.info("init /dev/stdout");

let buf = "";
let stdout_write = process.stdout.write;
process.stdout.write = function(str, enc, fd) {
	buf += str;
	buf = buf.slice(-MAXBUF);
	stdout_write.call(process.stdout, str, enc, fd);
}

//let buf = "Not implemented";
module.exports = function(req, res, next) {
	res.end(buf);
}
