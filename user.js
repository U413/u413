'use strict';

const tokens = {};

function randomRange(hi, lo) {
	return ((hi - lo)*Math.random() + lo)|0;
}
function random_id(n) {
	let s = "";
	for(let i = 0; i < n; ++i) {
		s += String.fromCharCode(randomRange(128, 32));
	}
	return s;
}

module.exports = {
	login(id) {
		let tid = random_id(8);
		tokens[tid] = {id};
		return tid;
	}
};
