'use strict';

const todo = [];

todo.push(() => {
	/**
	 * Replace all time tags with local equivalents
	**/
	for(let el of document.getElementsByTagName("time")) {
		let d = new Date(el.textContent);
		
		el.textContent =
			(d.getHours() + "").padStart(2, "0") + ":" +
			(d.getMinutes() + "").padStart(2, "0") + ":" +
			(d.getSeconds() + "").padStart(2, "0") + " " +
			(d.getFullYear() + "") + "-" +
			(d.getMonth() + "").padStart(2, "0") + "-" +
			(d.getDate() + "").padStart(2, "0");
		el.title = "HH:MM:SS YYYY-MM-DD"
	}
});

document.addEventListener("DOMContentLoaded", () => {
	for(let task of todo) {
		task();
	}
});

function $id(id) {
	return document.getElementById(id);
}

function $class(k) {
	return document.getElementsByClassName(k);
}
