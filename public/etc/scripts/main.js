'use strict';

const todo = []

todo.push(() => {
	/**
	 * Replace all time tags with local equivalents
	**/
	for(let el of document.getElementsByTagName("time")) {
		let d = new Date(parseInt(el.textContent));

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

/*
 * Create a promise that will never be fulfilled
 *  This is used for commands which reload the page so they don't
 *  exit early and write the prompt beforehand
**/
function liar() {
	return new Promise(() => 0);
}

function span(txt, k) {
	let el = document.createElement('span');
	el.innerText = txt;
	if(k) {
		el.className = k;
	}
	return el;
}

function tag(name, attrs, ...content) {
	let el = document.createElement(name);
	for(let a in attrs) {
		el.setAttribute(a, attrs[a]);
	}
	for(let c of content) {
		if(typeof c === 'string') {
			el.appendChild(document.createTextNode(c));
		}
		else if(c) {
			el.appendChild(c);
		}
	}
	return el;
}

function clobber(name) {
	return "$" + name.replace(/[^$_a-z\d]/i, "_");
}
