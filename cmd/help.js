'use strict';

const HELP =
	"login register post help";

module.exports = function(req, res) {
	res.end(`{"type":"ok","message":"${HELP}"}`)
}
