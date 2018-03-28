'use strict';

/*
let buf = "";
let stdout_write = process.stdout.write;
process.stdout.write = function(str, enc, fd) {
	buf += str;
	stdout_write.apply(process.stdout, str, enc, fd);
}
*/
let buf = "10";
module.exports = function(req, res, next) {
	res.end(buf);
}
