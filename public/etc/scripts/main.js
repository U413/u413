'use strict';

const todo = [];

todo.push(() => {
	/**
	 * Replace all time tags with local equivalents
	**/
	for(let el of document.getElementsByTagName("time")) {
		let d = new Date(el.textContent);
		
		el.textContent =
			`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} ` +
			`${d.getDate()}/${d.getMonth()}/${d.getFullYear()%100}`
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
